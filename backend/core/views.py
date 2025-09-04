from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from rest_framework import status
from core.models import User
from django.contrib.auth.hashers import make_password, check_password
import jwt
from django.conf import settings
from .serializers import UserSerializer, AdminSerializer
from django.contrib.auth.hashers import check_password
from core.models import Event
from .serializers import EventSerializer
from django.utils import timezone
from .models import Event
from .serializers import EventSerializer
from django.contrib.auth import get_user_model
from .models import Booking
from .serializers import BookingSerializer
import random
import datetime
from .models import Admin
from .serializers import AdminSerializer
JWT_SECRET = 'your_jwt_secret_key'
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_HOURS = 24 
User = get_user_model()

@api_view(['POST'])
def register(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(email=email).exists():
        return Response({'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    hashed_password = make_password(password)

    user = User.objects.create(
        name=name,
        email=email,
        password=hashed_password
    )

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    # First, check if the user exists in Users table
    try:
        user = User.objects.get(email=email)
        is_admin = user.is_admin  # Assuming User model has is_admin field
    except User.DoesNotExist:
        # Check Admin table
        try:
            user = Admin.objects.get(email=email)
            is_admin = True
        except Admin.DoesNotExist:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Check password
    if not check_password(password, user.password):
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Create JWT payload
    payload = {
        'id': user.id,
        'email': user.email,
        'name': getattr(user, 'name', ''),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXP_DELTA_HOURS),
        'is_admin': is_admin
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return Response({
        'message': 'Login successful',
        'userType': 'admin' if is_admin else 'user',
        'name': getattr(user, 'name', ''),
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': getattr(user, 'name', ''),
            'is_admin': is_admin
        }
    }, status=status.HTTP_200_OK)

# ADMIN VIEWS
# 🔹 Get all admins
@api_view(['GET'])
def get_all_admins(request):
    try:
        admins = Admin.objects.all().order_by('-created_at')
        serializer = AdminSerializer(admins, many=True)
        return Response({"admins": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 🔹 Get deleted admins
@api_view(['GET'])
def get_deleted_admins(request):
    try:
        deleted = Admin.objects.filter(status='deleted').order_by('-created_at')
        serializer = AdminSerializer(deleted, many=True)
        return Response({"deleted": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 🔹 Add admin
@api_view(['POST'])
def add_admin(request):
    try:
        data = request.data
        admin = Admin.objects.create(
            name=data.get('name'),
            email=data.get('email'),
            password=data.get('password'),  # In production, hash passwords!
            status='active'
        )
        serializer = AdminSerializer(admin)
        return Response({"message": "Admin added successfully", "admin": serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# 🔹 Update admin
@api_view(['PUT'])
def update_admin(request, admin_id):
    try:
        admin = Admin.objects.get(id=admin_id)
        data = request.data
        admin.name = data.get('name', admin.name)
        admin.email = data.get('email', admin.email)
        if data.get('password'):
            admin.password = data.get('password')  # Hash in production
        admin.save()
        serializer = AdminSerializer(admin)
        return Response({"message": "Admin updated successfully", "admin": serializer.data}, status=status.HTTP_200_OK)
    except Admin.DoesNotExist:
        return Response({"message": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# 🔹 Soft delete admin
@api_view(['POST'])
def delete_admin(request, admin_id):
    try:
        admin = Admin.objects.get(id=admin_id)
        admin.status = 'deleted'
        admin.save()
        return Response({"message": "Admin deleted successfully"}, status=status.HTTP_200_OK)
    except Admin.DoesNotExist:
        return Response({"message": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def list_admins(request):
    admins = User.objects.filter(is_admin=True, deleted=False)
    serializer = AdminSerializer(admins, many=True)
    return Response({"admin": serializer.data})

@api_view(['GET'])
def deleted_admins(request):
    admins = User.objects.filter(is_admin=True, deleted=True)
    serializer = AdminSerializer(admins, many=True)
    return Response({"deleted": serializer.data})

# USER VIEWS
@api_view(['GET'])
def get_users(request):
    users = User.objects.filter(is_admin=False)  
    data = []
    for user in users:
        data.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'deleted': user.deleted, 
        })
    return Response({'users': data})

@api_view(['GET'])
def get_deleted_users(request):
    users = User.objects.filter(is_admin=False, deleted=True)
    serializer = UserSerializer(users, many=True)
    return Response({'deleted': serializer.data})

@api_view(['POST'])
def add_user(request):
    data = request.data.copy()
    data['is_admin'] = False
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User ameongezwa'})
    return Response(serializer.errors, status=400)

@api_view(['PUT'])
def update_user(request, id):
    try:
        user = User.objects.get(id=id, is_admin=False)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User updated successfully'})
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def delete_user(request, id):
    try:
        user = User.objects.get(id=id, is_admin=False)
        user.deleted = True
        user.save()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)


@api_view(['POST'])
def change_password(request, id):
    old_password = request.data.get('currentPassword')
    new_password = request.data.get('newPassword')

    if not old_password or not new_password:
        return Response({'message': 'Weka password zote mbili'}, status=400)

    try:
        user = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)

    if not check_password(old_password, user.password):
        return Response({'message': 'Old password sio sahihi'}, status=401)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password imebadilishwa kikamilifu'})

# EVENTS

@api_view(['POST'])
def add_event(request):
    serializer = EventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Event added successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Get all events (AdminDashboard)
@api_view(['GET'])
def get_all_events(request):
    events = Event.objects.all()
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

# Get pending events (Dashboard)
@api_view(['GET'])
def get_pending_events(request):
    events = Event.objects.filter(status='pending')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

# Get approved events (AdminDashboard)
@api_view(['GET'])
def get_approved_events(request):
    events = Event.objects.filter(status='approved')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

# Approve event
@api_view(['PUT'])
def approve_event(request, id):
    try:
        event = Event.objects.get(id=id)
        event.status = 'approved'
        event.save()
        serializer = EventSerializer(event)
        return Response(serializer.data)
    except Event.DoesNotExist:
        return Response({'message': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

# Reject event
@api_view(['DELETE'])
def reject_event(request, id):
    try:
        event = Event.objects.get(id=id)
        event.status = 'rejected'
        event.save()
        return Response({'message': 'Event rejected'})
    except Event.DoesNotExist:
        return Response({'message': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['DELETE'])
def delete_event(request, id):
    try:
        event = Event.objects.get(id=id)
        event.delete()
        return Response({'message': 'Event deleted'})
    except Event.DoesNotExist:
        return Response({'message': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

# Optional: Edit event (PUT)
@api_view(['PUT'])
def update_event(request, id):
    try:
        event = Event.objects.get(id=id)
    except Event.DoesNotExist:
        return Response({'message': 'Event does not exist'}, status=status.HTTP_404_NOT_FOUND)

    serializer = EventSerializer(event, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_booking(request):
    try:
        data = request.data

        booking_id = f"TSP{random.randint(100000, 999999)}"

        # Get event details
        event = Event.objects.get(id=data.get('item_id'))

        booking = Booking.objects.create(
            booking_id=booking_id,
            user_name=data.get('user_name'),
            name=data.get('name'),
            std_id=data.get('std_id'),
            email=data.get('email'),
            item_type=data.get('item_type'),
            item_id=data.get('item_id'),
            item_name=event.title,      # save event title
            booking_date=data.get('booking_date'),
            status='active'
        )

        # Save organizer name too
        booking.organame = event.organame
        booking.save()

        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"message": f"Error creating booking: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

# 👉 Kupata bookings za user mmoja tu
@api_view(['GET'])
def get_user_bookings(request, username):
    try:
        bookings = Booking.objects.filter(user_name=username)
        serializer = BookingSerializer(bookings, many=True)
        return Response({"booking": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": f"Error fetching bookings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ✅ Get bookings za user mmoja
@api_view(['GET'])
def get_user_bookings(request, username):
    try:
        bookings = Booking.objects.filter(user_name=username, status='active')
        serializer = BookingSerializer(bookings, many=True)
        return Response({"bookings": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": f"Error fetching bookings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Get cancelled bookings za user mmoja
@api_view(['GET'])
def get_cancelled_bookings(request, username):
    try:
        bookings = Booking.objects.filter(user_name=username, status='cancelled')
        serializer = BookingSerializer(bookings, many=True)
        return Response({"cancelled": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": f"Error fetching cancelled bookings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Cancel booking
@api_view(['POST'])
def cancel_booking(request, booking_id):
    try:
        booking = Booking.objects.filter(booking_id=booking_id, status='active').first()
        if not booking:
            return Response({"message": "Booking not found or already cancelled."}, status=status.HTTP_404_NOT_FOUND)

        booking.status = 'cancelled'
        booking.save()
        return Response({"message": "Booking cancelled successfully."}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"message": f"Error cancelling booking: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_event_bookings(request, username):
    try:
        bookings = Booking.objects.filter(user_name=username, item_type='events')
        serializer = BookingSerializer(bookings, many=True)
        return Response({"booking": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": f"Error fetching user event bookings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 🔹 Get all bookings
@api_view(['GET'])
def admin_all_bookings(request):
    try:
        bookings = Booking.objects.all().order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response({"bookings": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": f"Error fetching bookings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🔹 Get confirmed bookings (active)
@api_view(['GET'])
def admin_confirmed_bookings(request):
    try:
        bookings = Booking.objects.filter(status='active').order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response({"confirmed": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": f"Error fetching confirmed bookings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🔹 Get cancelled bookings
@api_view(['GET'])
def admin_cancelled_bookings(request):
    try:
        bookings = Booking.objects.filter(status='cancelled').order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response({"cancelled": serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": f"Error fetching cancelled bookings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


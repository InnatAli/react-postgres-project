from django.urls import path
from . import views  # 👈 hii ni muhimu

urlpatterns = [
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),

    # Admin routes
    path('admins/', views.list_admins, name='list_admins'),
    path('admins/deleted', views.deleted_admins, name='deleted_admins'),
    path('admins/add', views.add_admin, name='add_admin'),
    path('admins/update/<int:id>', views.update_admin, name='update_admin'),
    path('admins/delete/<int:id>', views.delete_admin, name='delete_admin'),

    # User routes
    path('users/', views.get_users, name='get_users'),
    path('users/deleted', views.get_deleted_users, name='get_deleted_users'),
    path('users/add', views.add_user, name='add_user'),
    path('users/update/<int:id>', views.update_user, name='update_user'),
    path('users/delete/<int:id>', views.delete_user, name='delete_user'),
    path('users/change-password/<int:id>', views.change_password, name='change_password'),

       path('events/add', views.add_event),
    path('events/all', views.get_all_events),
    path('events/status/pending', views.get_pending_events),
    path('events/approve/<int:id>', views.approve_event),
    path('events/reject/<int:id>', views.reject_event),
    path('events/approved', views.get_approved_events),
    path('events/<int:id>/', views.update_event),   # edit
    path('events/<int:id>/delete', views.delete_event),

    path('booking', views.create_booking, name='create_booking'),
    path('user/eventsbooking/<str:username>', views.get_user_bookings),
     path('booking/<str:booking_id>/cancel', views.cancel_booking),  # POST
    path('user/booking/<str:username>', views.get_user_bookings),  # GET
    path('user/cancelled_bookings/<str:username>', views.get_cancelled_bookings),
     path('user/eventsbooking/<str:username>', views.get_user_event_bookings),
     path('api/admin/booking', views.admin_all_bookings, name='admin_all_bookings'),
    path('api/admin/confirmed_bookings', views.admin_confirmed_bookings, name='admin_confirmed_bookings'),
    path('api/admin/cancelled_bookings', views.admin_cancelled_bookings, name='admin_cancelled_bookings'),

        path('api/admin/admins', views.get_all_admins, name='get_all_admins'),
    path('api/admin/deleted-admins', views.get_deleted_admins, name='get_deleted_admins'),
    path('api/admin/admins/add', views.add_admin, name='add_admin'),
    path('api/admin/admins/<int:admin_id>/update', views.update_admin, name='update_admin'),
    path('api/admin/admins/<int:admin_id>/delete', views.delete_admin, name='delete_admin'),
]

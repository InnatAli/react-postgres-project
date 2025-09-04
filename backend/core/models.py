from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, deleted=False, is_admin=False):
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(
            email=self.normalize_email(email),
            name=name,
            deleted=deleted,
            is_admin=is_admin,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

class Event(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateField()
    organame = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return self.title

from django.db import models

class Booking(models.Model):
    BOOKING_TYPES = (
        ('events', 'Events'),

    )

    booking_id = models.CharField(max_length=20, unique=True)
    user_name = models.CharField(max_length=150)
    name = models.CharField(max_length=150)
    std_id = models.CharField(max_length=50)
    email = models.EmailField()
    item_type = models.CharField(max_length=20, choices=BOOKING_TYPES)
    item_id = models.PositiveIntegerField()
    item_name = models.CharField(max_length=255)  # jina la event/transport
    booking_date = models.DateField()
    status = models.CharField(max_length=20, default='active')  # active/cancelled
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_id} - {self.user_name} ({self.status})"


class Admin(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    status = models.CharField(max_length=10, default='active')  # active/deleted
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
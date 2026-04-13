from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionPlanViewSet, FirmSubscriptionViewSet

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscriptionplan')
router.register(r'firm-subscriptions', FirmSubscriptionViewSet, basename='firmsubscription')

urlpatterns = [
    path('', include(router.urls)),
]

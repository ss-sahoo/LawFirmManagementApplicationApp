from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FirmViewSet, BranchViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'firms', FirmViewSet, basename='firm')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]

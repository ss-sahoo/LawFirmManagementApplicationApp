from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseViewSet, HearingViewSet, CaseDraftViewSet

router = DefaultRouter()
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'hearings', HearingViewSet, basename='hearing')
router.register(r'drafts', CaseDraftViewSet, basename='casedraft')

urlpatterns = [
    path('', include(router.urls)),
]

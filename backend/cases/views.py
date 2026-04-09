from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Case, CaseActivity, Hearing, CaseDraft
from .serializers import (
    CaseSerializer, CaseActivitySerializer, 
    HearingSerializer, CaseDraftSerializer
)
from audit.models import AuditLog

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'platform_owner':
            return Case.objects.all()
        # Firm-specific filtering
        return Case.objects.filter(firm=user.firm)

    def perform_create(self, serializer):
        case = serializer.save(firm=self.request.user.firm)
        # Log activity
        CaseActivity.objects.create(
            case=case,
            performed_by=self.request.user,
            activity_type='case_created',
            description=f"Case created: {case.case_title}"
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        case = serializer.save()
        new_status = case.status
        
        if old_status != new_status:
            CaseActivity.objects.create(
                case=case,
                performed_by=self.request.user,
                activity_type='status_change',
                description=f"Status changed from {old_status} to {new_status}",
                previous_status=old_status,
                new_status=new_status
            )

class HearingViewSet(viewsets.ModelViewSet):
    queryset = Hearing.objects.all()
    serializer_class = HearingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Hearing.objects.filter(case__firm=self.request.user.firm)

class CaseDraftViewSet(viewsets.ModelViewSet):
    queryset = CaseDraft.objects.all()
    serializer_class = CaseDraftSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CaseDraft.objects.filter(case__firm=self.request.user.firm)

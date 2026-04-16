from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db.models import Q
from .models import UserDocument
from .serializers import UserDocumentSerializer, UserDocumentListSerializer


class UserDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing documents with soft-delete and permission-based access.
    
    Permissions:
    - Super Admin: Can see all documents in their firm
    - Advocate: Can see documents for clients assigned to them
    - Client: Can see only their own documents
    - Everyone can upload documents
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserDocumentListSerializer
        return UserDocumentSerializer
    
    def get_queryset(self):
        """
        Filter documents based on user permissions.
        By default, only show non-deleted documents.
        """
        user = self.request.user
        show_deleted = self.request.query_params.get('show_deleted', 'false').lower() == 'true'
        
        # Base queryset
        queryset = UserDocument.objects.all()
        
        # Filter by deletion status
        if not show_deleted:
            queryset = queryset.filter(is_deleted=False)
        
        # Permission-based filtering
        if user.user_type == 'platform_owner':
            # Platform owner sees everything
            return queryset
        
        elif user.user_type in ['super_admin', 'admin']:
            # Super admin sees all documents in their firm
            return queryset.filter(firm=user.firm)
        
        elif user.user_type == 'advocate':
            # Advocate sees:
            # 1. Documents they uploaded
            # 2. Documents for clients assigned to them
            # 3. Documents for cases assigned to them
            return queryset.filter(
                Q(firm=user.firm) & (
                    Q(uploaded_by=user) |
                    Q(client__assigned_advocate=user) |
                    Q(case__assigned_advocate=user)
                )
            )
        
        elif user.user_type == 'paralegal':
            # Paralegal sees:
            # 1. Documents they uploaded
            # 2. Documents for cases assigned to them
            return queryset.filter(
                Q(firm=user.firm) & (
                    Q(uploaded_by=user) |
                    Q(case__assigned_paralegal=user)
                )
            )
        
        elif user.user_type == 'client':
            # Client sees only their own documents
            if hasattr(user, 'client_profile'):
                return queryset.filter(client=user.client_profile)
            return queryset.filter(uploaded_by=user)
        
        # Default: only documents uploaded by the user
        return queryset.filter(uploaded_by=user)
    
    def get_object(self):
        """Check permissions before returning object"""
        pk = self.kwargs.get('pk')
        try:
            obj = UserDocument.objects.get(pk=pk)
        except UserDocument.DoesNotExist:
            from django.http import Http404
            raise Http404
        
        # Check if user has permission to access this document
        if not self.get_queryset().filter(pk=pk).exists():
            raise PermissionDenied("You do not have permission to access this document.")
        
        return obj
    
    def perform_create(self, serializer):
        """Create document with proper firm assignment"""
        user = self.request.user
        
        # Determine firm
        firm = None
        if user.user_type in ['super_admin', 'admin', 'advocate', 'paralegal']:
            firm = user.firm
        elif user.user_type == 'client' and hasattr(user, 'client_profile'):
            firm = user.client_profile.firm
        
        if not firm:
            raise PermissionDenied("Unable to determine firm for document upload.")
        
        # Auto-assign client if user is a client
        client = None
        if user.user_type == 'client' and hasattr(user, 'client_profile'):
            client = user.client_profile
        
        serializer.save(
            uploaded_by=user,
            firm=firm,
            client=client or serializer.validated_data.get('client')
        )
    
    def perform_update(self, serializer):
        """Update document with permission checks"""
        user = self.request.user
        obj = self.get_object()
        
        # Only super_admin/admin can update verification status
        if 'verification_status' in self.request.data:
            if user.user_type not in ['platform_owner', 'super_admin', 'admin']:
                raise PermissionDenied("Only admins can verify documents.")
            
            # Update verification details
            if self.request.data['verification_status'] in ['verified', 'rejected']:
                serializer.save(
                    verified_by=user,
                    verified_at=timezone.now()
                )
                return
        
        serializer.save()
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete instead of hard delete.
        Only super_admin can delete documents.
        """
        user = request.user
        
        if user.user_type not in ['platform_owner', 'super_admin', 'admin']:
            raise PermissionDenied("Only super admins can delete documents.")
        
        document = self.get_object()
        
        if document.is_deleted:
            return Response(
                {"detail": "Document is already deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        document.soft_delete(user)
        
        return Response(
            {"detail": "Document soft-deleted successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted document"""
        user = request.user
        
        if user.user_type not in ['platform_owner', 'super_admin', 'admin']:
            raise PermissionDenied("Only super admins can restore documents.")
        
        document = self.get_object()
        
        if not document.is_deleted:
            return Response(
                {"detail": "Document is not deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        document.restore()
        
        return Response(
            {"detail": "Document restored successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def my_documents(self, request):
        """Get documents uploaded by the current user"""
        queryset = self.get_queryset().filter(uploaded_by=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Get documents for a specific client"""
        client_id = request.query_params.get('client_id')
        
        if not client_id:
            return Response(
                {"detail": "client_id parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(client_id=client_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_case(self, request):
        """Get documents for a specific case"""
        case_id = request.query_params.get('case_id')
        
        if not case_id:
            return Response(
                {"detail": "case_id parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(case_id=case_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get documents by document type"""
        doc_type = request.query_params.get('type')
        
        if not doc_type:
            return Response(
                {"detail": "type parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(document_type=doc_type)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def deleted(self, request):
        """Get all soft-deleted documents (admin only)"""
        user = request.user
        
        if user.user_type not in ['platform_owner', 'super_admin', 'admin']:
            raise PermissionDenied("Only admins can view deleted documents.")
        
        queryset = self.get_queryset().filter(is_deleted=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

from django.contrib import admin
from .models import UserDocument


@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'document_title', 'uploaded_by', 'firm', 'client', 'document_type', 
        'verification_status', 'is_deleted', 'uploaded_at'
    ]
    list_filter = [
        'document_type', 'verification_status', 'is_deleted', 
        'uploaded_at', 'firm'
    ]
    search_fields = [
        'document_title', 'uploaded_by__email', 'uploaded_by__first_name',
        'uploaded_by__last_name', 'document_number', 'client__first_name',
        'client__last_name'
    ]
    readonly_fields = [
        'id', 'uploaded_at', 'updated_at', 'verified_at', 
        'deleted_at', 'verified_by', 'deleted_by'
    ]
    
    fieldsets = (
        ('Document Information', {
            'fields': ('document_title', 'document_type', 'document_category', 
                      'document_number', 'document_file', 'description')
        }),
        ('Relationships', {
            'fields': ('uploaded_by', 'firm', 'client', 'case')
        }),
        ('Verification', {
            'fields': ('verification_status', 'verified_by', 'verification_notes', 'verified_at')
        }),
        ('Version Control', {
            'fields': ('version', 'parent_document')
        }),
        ('Deletion Status', {
            'fields': ('is_deleted', 'deleted_at', 'deleted_by')
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        """Show all documents including soft-deleted ones in admin"""
        return super().get_queryset(request)

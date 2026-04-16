from django.db import models
from django.utils import timezone
import uuid


class UserDocument(models.Model):
    """Store user documents for verification - Soft delete enabled"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('aadhar', 'Aadhar Card'),
        ('pan', 'PAN Card'),
        ('passport', 'Passport'),
        ('driving_license', 'Driving License'),
        ('bar_certificate', 'Bar Council Certificate'),
        ('degree', 'Educational Degree'),
        ('fir', 'FIR'),
        ('petition', 'Petition'),
        ('evidence', 'Evidence'),
        ('order', 'Court Order'),
        ('agreement', 'Agreement'),
        ('affidavit', 'Affidavit'),
        ('notice', 'Legal Notice'),
        ('contract', 'Contract'),
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('correspondence', 'Correspondence'),
        ('medical_report', 'Medical Report'),
        ('police_report', 'Police Report'),
        ('witness_statement', 'Witness Statement'),
        ('power_of_attorney', 'Power of Attorney'),
        ('vakalatnama', 'Vakalatnama'),
        ('other', 'Other'),
    ]
    
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    uploaded_by = models.ForeignKey(
        'accounts.CustomUser', 
        on_delete=models.CASCADE, 
        related_name='uploaded_documents',
        null=True,
        blank=True,
        help_text="User who uploaded this document"
    )
    firm = models.ForeignKey(
        'firms.Firm', 
        on_delete=models.CASCADE, 
        related_name='firm_documents',
        null=True,
        blank=True,
        help_text="Firm this document belongs to"
    )
    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='client_documents',
        help_text="Client this document is related to"
    )
    case = models.ForeignKey(
        'cases.Case', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='case_documents',
        help_text="Case this document is related to"
    )
    
    # Document details
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    document_category = models.CharField(max_length=50, blank=True, null=True, help_text="Custom category for grouping")
    document_title = models.CharField(max_length=255, blank=True, null=True, help_text="Title/name of the document")
    document_number = models.CharField(max_length=100, blank=True, null=True, help_text="Document reference number")
    document_file = models.FileField(upload_to='documents/%Y/%m/%d/')
    description = models.TextField(blank=True, null=True, help_text="Description or notes about the document")
    
    # Verification
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='pending'
    )
    verified_by = models.ForeignKey(
        'accounts.CustomUser', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_documents'
    )
    verification_notes = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Soft delete - documents are never actually deleted
    is_deleted = models.BooleanField(default=False, help_text="Soft delete flag")
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        'accounts.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_documents'
    )
    
    # Version tracking (for array-like storage of multiple versions)
    version = models.IntegerField(default=1, help_text="Version number of this document")
    parent_document = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='versions',
        help_text="Original document if this is a new version"
    )
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['firm', 'is_deleted']),
            models.Index(fields=['client', 'is_deleted']),
            models.Index(fields=['case', 'is_deleted']),
            models.Index(fields=['uploaded_by', 'is_deleted']),
        ]
    
    def __str__(self):
        return f"{self.document_title} - {self.get_document_type_display()}"
    
    def soft_delete(self, user):
        """Soft delete the document"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()
    
    def restore(self):
        """Restore a soft-deleted document"""
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()

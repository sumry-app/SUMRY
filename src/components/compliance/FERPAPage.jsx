import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Lock, Eye, Download, Trash2, FileText, CheckCircle,
  AlertTriangle, Users, Database, Key, Clock
} from 'lucide-react';

/**
 * FERPAPage - Feature #31: FERPA Transparency Page
 *
 * Comprehensive FERPA compliance information and data controls
 * Transparent data practices for parents and administrators
 */
export default function FERPAPage({ onExportData, onDeleteData }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">FERPA Compliance</h1>
        </div>
        <p className="text-lg text-gray-600">
          Your privacy and data security are our top priorities
        </p>
      </div>

      {/* FERPA Overview */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            SUMRY is FERPA Compliant
          </h2>
          <p className="text-gray-700 mb-4">
            The Family Educational Rights and Privacy Act (FERPA) is a federal law that protects
            the privacy of student education records. SUMRY adheres to all FERPA requirements.
          </p>
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>What this means for you:</strong> Your student data is encrypted, secure,
              and only accessible to authorized educational personnel. You have full control over
              your data and can export or delete it at any time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Your FERPA Rights
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Eye,
                title: 'Right to Inspect',
                description: 'Parents and eligible students have the right to inspect and review education records.',
                action: 'View all data collected about your student'
              },
              {
                icon: Download,
                title: 'Right to Export',
                description: 'Request copies of education records in a portable format.',
                action: 'Download your data as JSON or CSV'
              },
              {
                icon: Trash2,
                title: 'Right to Delete',
                description: 'Request correction or deletion of inaccurate or misleading information.',
                action: 'Submit deletion request'
              },
              {
                icon: Shield,
                title: 'Right to Privacy',
                description: 'Control disclosure of personally identifiable information.',
                action: 'Manage privacy settings'
              }
            ].map((right, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      {React.createElement(right.icon, { className: 'w-6 h-6 text-blue-600' })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{right.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{right.description}</p>
                      <Badge variant="outline" className="text-xs">{right.action}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data We Collect */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-green-600" />
            What Data We Collect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                category: 'Student Information',
                items: ['Name', 'Grade Level', 'Disability Category', 'IEP Goals']
              },
              {
                category: 'Progress Data',
                items: ['Trial-by-trial performance', 'Session notes', 'Progress charts', 'Achievement data']
              },
              {
                category: 'Educational Records',
                items: ['IEP meeting notes', 'Baseline assessments', 'Target goals', 'Service logs']
              },
              {
                category: 'User Activity',
                items: ['Login timestamps', 'Data entry logs', 'Report generation', 'System usage']
              }
            ].map((section, index) => (
              <Card key={index} className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{section.category}</h3>
                  <ul className="space-y-1">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Measures */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-green-600" />
            How We Protect Your Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Lock,
                title: 'Encryption',
                description: 'All data encrypted in transit and at rest using industry-standard AES-256'
              },
              {
                icon: Key,
                title: 'Access Control',
                description: 'Role-based permissions ensure only authorized personnel can view data'
              },
              {
                icon: Shield,
                title: 'Secure Storage',
                description: 'Data stored in FERPA-compliant cloud infrastructure with redundant backups'
              },
              {
                icon: Eye,
                title: 'Audit Logging',
                description: 'Every data access is logged and timestamped for accountability'
              },
              {
                icon: Users,
                title: 'Staff Training',
                description: 'All users trained on FERPA requirements and data privacy best practices'
              },
              {
                icon: Clock,
                title: 'Regular Audits',
                description: 'Quarterly security audits and compliance reviews'
              }
            ].map((measure, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="pt-4 pb-4 text-center">
                  {React.createElement(measure.icon, { className: 'w-8 h-8 mx-auto mb-2 text-green-600' })}
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">{measure.title}</h3>
                  <p className="text-xs text-gray-600">{measure.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Control Actions */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Control Center</h2>
          <div className="space-y-3">
            <Button
              onClick={onExportData}
              className="w-full justify-start h-auto py-4 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Export All Data</div>
                <div className="text-xs opacity-90">Download a complete copy of all student data in JSON format</div>
              </div>
            </Button>

            <Button
              onClick={onDeleteData}
              variant="outline"
              className="w-full justify-start h-auto py-4 border-2 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5 mr-3 text-red-600" />
              <div className="text-left">
                <div className="font-semibold text-red-600">Request Data Deletion</div>
                <div className="text-xs text-gray-600">Submit a request to permanently delete student records</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Questions or Concerns?</h2>
          <p className="text-sm text-gray-700 mb-4">
            If you have questions about FERPA compliance, data privacy, or wish to exercise your rights,
            please contact your school's data privacy officer or SUMRY support.
          </p>
          <div className="flex gap-3">
            <Button variant="outline">Contact Support</Button>
            <Button variant="outline">View Privacy Policy</Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {new Date().toLocaleDateString()} | FERPA Compliance v2.0
      </div>
    </div>
  );
}

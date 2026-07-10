import { Section, Text, Hr } from '@react-email/components';
import { EmailLayout, body, heading, paragraph, disclaimerBox, disclaimerText } from './components';

const infoRow = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 8px 0',
};

const infoLabel = {
  fontWeight: '700' as const,
  color: '#111827',
};

const summaryBox = {
  backgroundColor: '#f0f9ff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #bae6fd',
  marginBottom: '24px',
};

const requestBox = {
  backgroundColor: '#fefce8',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #fde68a',
  marginBottom: '24px',
};

const badge = {
  display: 'inline-block' as const,
  padding: '3px 10px',
  borderRadius: '99px',
  fontSize: '11px',
  fontWeight: '700' as const,
  letterSpacing: '0.05em',
  backgroundColor: '#dbeafe',
  color: '#1e40af',
};

export default function AdminSubjectRequestEmail({
  requesterName,
  requesterEmail,
  subjectName,
  branch,
  semester,
  additionalNote,
}: {
  requesterName: string;
  requesterEmail: string;
  subjectName: string;
  branch: string;
  semester: number | string;
  additionalNote?: string;
}) {
  const semesterLabel = semester === 0 || semester === '0' ? '1st Year' : `Semester ${semester}`;

  return (
    <EmailLayout previewText={`📚 Subject Request: "${subjectName}" for ${branch} — ${semesterLabel}`}>
      <Section style={body}>
        <Text style={heading}>📚 Subject Addition Request</Text>
        <Text style={paragraph}>
          A student has requested that you add a new subject to the Notes Hub. Review the details
          below and add it from the admin panel if applicable.
        </Text>

        {/* Requested Subject */}
        <Text style={{ ...paragraph, fontWeight: '700', margin: '0 0 8px 0' }}>
          🎯 Requested Subject
        </Text>
        <Section style={requestBox}>
          <Text style={{ ...infoRow, fontSize: '20px', fontWeight: '900', color: '#000', margin: '0 0 4px 0' }}>
            {subjectName}
          </Text>
          <Text style={{ ...infoRow, margin: 0 }}>
            <span style={badge}>{branch}</span>
            {'  '}
            <span style={{ ...badge, backgroundColor: '#f0fdf4', color: '#15803d' }}>{semesterLabel}</span>
          </Text>
        </Section>

        {/* Requester Info */}
        <Text style={{ ...paragraph, fontWeight: '700', margin: '0 0 8px 0' }}>
          👤 Requested By
        </Text>
        <Section style={summaryBox}>
          <Text style={{ ...infoRow, margin: '0 0 6px 0' }}>
            <span style={infoLabel}>Name: </span>{requesterName}
          </Text>
          <Text style={{ ...infoRow, margin: 0 }}>
            <span style={infoLabel}>Email: </span>{requesterEmail}
          </Text>
        </Section>

        {/* Additional Note */}
        {additionalNote && (
          <>
            <Text style={{ ...paragraph, fontWeight: '700', margin: '0 0 8px 0' }}>
              💬 Student&apos;s Note
            </Text>
            <Section style={{ ...summaryBox, backgroundColor: '#fafafa', borderColor: '#e5e7eb' }}>
              <Text style={{ ...infoRow, margin: 0, fontStyle: 'italic', color: '#6b7280' }}>
                &ldquo;{additionalNote}&rdquo;
              </Text>
            </Section>
          </>
        )}

        <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

        <Section style={disclaimerBox}>
          <Text style={disclaimerText}>
            This request was submitted through the MNIT Marketplace Notes Hub upload wizard.
            Log in to the admin panel to add subjects: mnitmarketplace.store/admin
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
}

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#27ae60',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d1111',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#556b7f',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#ffffff',
    borderLeftWidth: 3,
  },
  rulePassed: {
    borderLeftColor: '#27ae60',
  },
  ruleFailed: {
    borderLeftColor: '#c0392b',
  },
  ruleWarning: {
    borderLeftColor: '#f39c12',
  },
  ruleName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0d1111',
    marginBottom: 3,
  },
  ruleDetails: {
    fontSize: 10,
    color: '#556b7f',
    lineHeight: 1.4,
  },
  statusBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 8,
  },
  statusPass: {
    backgroundColor: '#27ae60',
    color: '#ffffff',
  },
  statusFail: {
    backgroundColor: '#c0392b',
    color: '#ffffff',
  },
  statusWarning: {
    backgroundColor: '#f39c12',
    color: '#ffffff',
  },
  summary: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#0d1111',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    fontSize: 10,
    color: '#95a5a6',
  },
});

export function generatePDFDocument(results) {
  const passRules = results.rules.filter(r => r.status === 'pass');
  const failRules = results.rules.filter(r => r.status === 'fail');
  const warningRules = results.rules.filter(r => r.status === 'warning');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FireSafe LK Analysis Report</Text>
          <Text style={styles.subtitle}>
            Submission ID: {results.submissionId}
          </Text>
          <Text style={styles.subtitle}>
            Generated: {results.timestamp.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summary}>{results.summary}</Text>
          <Text style={[styles.summary, { marginTop: 10 }]}>
            Analysis Completion: {results.completionPercentage}%
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Status</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text
              style={[
                styles.statusBadge,
                results.overallStatus === 'pass'
                  ? styles.statusPass
                  : results.overallStatus === 'fail'
                    ? styles.statusFail
                    : styles.statusWarning,
              ]}
            >
              {results.overallStatus.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 12, color: '#0d1111', marginTop: 5 }}>
              Errors: {results.errorCount} | Warnings: {results.warningCount}
            </Text>
          </View>
        </View>

        {failRules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critical Issues ({failRules.length})</Text>
            {failRules.map((rule, index) => (
              <View
                key={index}
                style={[styles.ruleRow, styles.ruleFailed]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.ruleName}>{rule.name}</Text>
                  <Text style={styles.ruleDetails}>{rule.details}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {warningRules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warnings ({warningRules.length})</Text>
            {warningRules.slice(0, 3).map((rule, index) => (
              <View
                key={index}
                style={[styles.ruleRow, styles.ruleWarning]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.ruleName}>{rule.name}</Text>
                  <Text style={styles.ruleDetails}>{rule.details}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliant Rules ({passRules.length})</Text>
          <Text style={styles.ruleDetails}>
            {passRules.length} out of {results.rules.length} fire safety rules are met.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>FireSafe LK - Automated Fire Safety Certification System</Text>
          <Text>Report generated on {results.timestamp.toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}

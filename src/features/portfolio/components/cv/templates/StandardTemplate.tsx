import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { CVData } from "../../../types/cv";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    color: "#334155",
  },
  header: {
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 20,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
    color: "#64748b",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 3,
    marginBottom: 8,
  },
  entry: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  entryDate: {
    fontSize: 10,
    color: "#64748b",
  },
  entrySubHeader: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#475569",
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#334155",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  skillsColumn: {
    flex: 1,
  },
});

export function StandardTemplate({ data }: { data: CVData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName || "Your Full Name"}</Text>
          <Text style={styles.contact}>
            {[data.email, data.phone, data.location]
              .filter(Boolean)
              .join("  |  ") || "email@example.com  |  +62 812 3456 7890"}
          </Text>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.description}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience.some((exp) => exp.title || exp.company) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.experience.map((exp) => {
              if (!exp.title && !exp.company) return null;
              return (
                <View key={exp.id} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{exp.title || "Position Title"}</Text>
                    <Text style={styles.entryDate}>{exp.years || "Dates"}</Text>
                  </View>
                  <Text style={styles.entrySubHeader}>
                    {exp.company || "Company Name"}
                    {exp.location ? `, ${exp.location}` : ""}
                  </Text>
                  {exp.description && (
                    <Text style={styles.description}>{exp.description}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {data.education.some((edu) => edu.degree || edu.school) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu) => {
              if (!edu.degree && !edu.school) return null;
              return (
                <View key={edu.id} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{edu.degree || "Degree Name"}</Text>
                    <Text style={styles.entryDate}>{edu.years || "Dates"}</Text>
                  </View>
                  <Text style={styles.entrySubHeader}>
                    {edu.school || "University Name"}
                    {edu.location ? `, ${edu.location}` : ""}
                  </Text>
                  {edu.description && (
                    <Text style={[styles.description, { fontStyle: "italic" }]}>
                      {edu.description}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Skills & Languages */}
        <View style={styles.skillsGrid}>
          {data.skills && (
            <View style={styles.skillsColumn}>
              <Text style={styles.sectionTitle}>Technical Skills</Text>
              <Text style={styles.description}>{data.skills}</Text>
            </View>
          )}
          {data.languages && (
            <View style={styles.skillsColumn}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <Text style={styles.description}>{data.languages}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

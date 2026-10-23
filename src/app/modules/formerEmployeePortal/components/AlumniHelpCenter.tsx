import {
  AccessTimeRounded,
  ContactMailOutlined,
  ExpandMoreRounded,
  HelpOutlineRounded,
  MailOutlineRounded,
  PhoneInTalkOutlined,
  QuestionAnswerRounded,
  SecurityRounded,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

type Props = {
  companyName?: string;
  onRequest: () => void;
};

const faqs = [
  {
    question: "When are Relieving and Experience letters officially issued?",
    answer:
      "Relieving and Experience certificates are typically generated within 7 to 10 working days following your last working day (LWD), after all departmental asset clearances and project handovers have been formally signed off by your reporting manager and HR.",
  },
  {
    question: "How and when will my Full & Final (FnF) settlement be credited?",
    answer:
      "Full and Final settlements are processed during the standard company payroll cycle following your exit month (usually within 30 to 45 days of LWD). The final settlement statement will be uploaded directly to your Document Vault, and the balance amount transferred to your registered salary account.",
  },
  {
    question: "How can I obtain my Form 16 / TDS certificate for tax filing?",
    answer:
      "Form 16 (Part A & Part B) is generated as per statutory government timelines after the end of the financial year (typically around mid-June). Once generated, it is automatically posted to the Tax & FnF tab in your Document Vault. You can also raise a request here if you need an interim statement.",
  },
  {
    question: "How long will I maintain active access to this Former Employee Portal?",
    answer:
      "Former employees maintain continuous secure access for up to 180 days (6 months) post-exit using their verified personal email address. If you require access beyond this period, you may reach out to the HR Operations team for an access extension.",
  },
  {
    question: "What if my personal email, phone number, or residential address changes?",
    answer:
      "You can submit an 'Update Contact Details' request through the Request Desk in this portal. Provide your updated personal email and contact number, and our HR team will verify and update your alumni profile accordingly.",
  },
  {
    question: "Can prospective employers contact Codeji for employment verification (BGV)?",
    answer:
      "Yes. Prospective employers and background verification (BGV) agencies should direct formal verification requests along with your signed authorization letter to the official HR verification desk at hr@codeji.in.",
  },
];

export const AlumniHelpCenter = ({
  companyName = "Codeji Infotech Pvt Ltd",
  onRequest,
}: Props) => {
  const [expanded, setExpanded] = useState<string | false>("faq-0");

  const handleChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Stack spacing={3}>
      {/* Help Center Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          gap={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <HelpOutlineRounded color="primary" />
              <Typography variant="h6" fontWeight={850}>
                Alumni Support & Help Center
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Find quick answers to common post-employment questions or connect directly with People Operations.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<QuestionAnswerRounded />}
            onClick={onRequest}
            sx={{
              textTransform: "none",
              fontWeight: 750,
              background: "linear-gradient(90deg, #0d9488, #0f766e)",
              color: "#ffffff !important",
              boxShadow: "0 4px 14px rgba(13, 148, 136, 0.28)",
              "&:hover": {
                background: "linear-gradient(90deg, #0f766e, #115e59)",
              },
            }}
          >
            Ask HR a Question
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(0, 0.85fr)" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* FAQs Accordion */}
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
            Frequently Asked Questions
          </Typography>
          <Stack spacing={1.5}>
            {faqs.map((faq, index) => (
              <Accordion
                key={faq.question}
                expanded={expanded === `faq-${index}`}
                onChange={handleChange(`faq-${index}`)}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: expanded === `faq-${index}` ? "primary.main" : "divider",
                  borderRadius: "14px !important",
                  "&::before": { display: "none" },
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRounded />}
                  sx={{
                    px: 2.25,
                    py: 1,
                    fontWeight: 750,
                    fontSize: "0.95rem",
                    bgcolor: expanded === `faq-${index}` ? "action.hover" : "transparent",
                  }}
                >
                  {faq.question}
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.25, pb: 2.25, pt: 1, color: "text.secondary", lineHeight: 1.6 }}>
                  <Typography variant="body2">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>

        {/* Contact HR Cards */}
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: "rgba(13, 148, 136, 0.1)",
                  color: "#0d9488",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <ContactMailOutlined fontSize="small" />
              </Box>
              <Box>
                <Typography fontWeight={800} fontSize={15}>
                  People Operations Desk
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {companyName}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <MailOutlineRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Direct Email
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    hr@codeji.in
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="center">
                <AccessTimeRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Support Hours
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    Monday – Friday, 9:30 AM – 6:30 PM IST
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="center">
                <SecurityRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    SLA Response Time
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    Within 24 to 48 business hours
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Button
              fullWidth
              variant="outlined"
              onClick={onRequest}
              sx={{ textTransform: "none", fontWeight: 750 }}
            >
              Submit Tracked Inquiry
            </Button>
          </Paper>

          {/* Quick Notice Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" fontWeight={800}>
              Need Emergency Verification?
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", lineHeight: 1.5 }}>
              If your background verification or visa processing requires urgent HR sign-off, mark your request priority or have your agency include your Employee ID in the email subject.
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
};

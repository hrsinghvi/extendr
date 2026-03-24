import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Button,
  Font,
} from "@react-email/components";
import * as React from "react";

// ─── Color tokens ───
const colors = {
  bg: "#050609",
  card: "#0a0e14",
  surface: "#0d1117",
  border: "#1a2029",
  borderSubtle: "#161c24",
  greenPrimary: "#5A9665",
  greenDark: "#1a291c",
  greenMuted: "#141f16",
  blue: "#6f97b3",
  blueDark: "#141d22",
  white: "#ffffff",
  textPrimary: "#ffffff",
  textSecondary: "#888888",
  textMuted: "#666666",
  textDim: "#555555",
  textFaint: "#444444",
};

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const monoFamily = "'Courier New', Courier, monospace";

// ─── Reusable components ───

function PillBadge({
  children,
  color = colors.greenPrimary,
  borderColor = "#253c28",
  bgColor = "#0e1510",
}: {
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
  bgColor?: string;
}) {
  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      border={0}
      role="presentation"
      style={{ margin: "0 auto" }}
    >
      <tr>
        <td
          style={{
            padding: "8px 20px",
            borderRadius: "100px",
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            fontFamily,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color,
              textTransform: "uppercase" as const,
              letterSpacing: "2.5px",
              fontFamily,
            }}
          >
            {children}
          </span>
        </td>
      </tr>
    </table>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      border={0}
      role="presentation"
      style={{ marginBottom: "16px" }}
    >
      <tr>
        <td
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: `1px solid ${colors.border}`,
            backgroundColor: "#10151b",
            fontFamily,
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#999999",
              textTransform: "uppercase" as const,
              letterSpacing: "2px",
              fontFamily,
            }}
          >
            {children}
          </span>
        </td>
      </tr>
    </table>
  );
}

function GreenButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      href={href}
      style={{
        display: "inline-block",
        padding: "16px 48px",
        backgroundColor: colors.greenPrimary,
        color: colors.white,
        fontSize: "16px",
        fontWeight: 700,
        textDecoration: "none",
        borderRadius: "100px",
        letterSpacing: "0.2px",
        fontFamily,
        textAlign: "center" as const,
      }}
    >
      {children}
    </Button>
  );
}

function OutlineButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      href={href}
      style={{
        display: "inline-block",
        padding: "12px 28px",
        backgroundColor: "#111519",
        color: colors.white,
        fontSize: "14px",
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: "100px",
        border: `1px solid ${colors.border}`,
        fontFamily,
        textAlign: "center" as const,
      }}
    >
      {children}
    </Button>
  );
}

function StatusDot({ color }: { color: string }) {
  return (
    <td style={{ verticalAlign: "middle", paddingRight: "8px" }}>
      <table cellPadding="0" cellSpacing="0" border={0} role="presentation">
        <tr>
          <td
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: color,
              fontSize: "0",
              lineHeight: "0",
            }}
            width="6"
            height="6"
          >
            &nbsp;
          </td>
        </tr>
      </table>
    </td>
  );
}

function FileRow({ name, color }: { name: string; color: string }) {
  return (
    <tr>
      <StatusDot color={color} />
      <td
        style={{
          fontSize: "11px",
          color: colors.textMuted,
          fontFamily: monoFamily,
          paddingBottom: "4px",
        }}
      >
        {name}
      </td>
    </tr>
  );
}

function StepCircle({ num, gradient }: { num: string; gradient: string }) {
  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      border={0}
      role="presentation"
      style={{ margin: "0 auto 16px" }}
      align="center"
    >
      <tr>
        <td
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: gradient,
            textAlign: "center" as const,
            lineHeight: "48px",
            fontSize: "18px",
            fontWeight: 800,
            color: colors.white,
            fontFamily,
          }}
          width="48"
          height="48"
        >
          {num}
        </td>
      </tr>
    </table>
  );
}

// ─── Main Email ───

export default function WaitlistLaunchInvite() {
  const ctaUrl = "{{CTA_URL}}";

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        Extendr is live. Build Chrome extensions with AI, ship them, earn
        revenue. Your early access is ready.
      </Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: colors.bg,
          fontFamily,
          WebkitFontSmoothing: "antialiased" as any,
        }}
      >
        {/* ═══ GREEN ACCENT BAR ═══ */}
        <Section
          style={{
            height: "4px",
            background: `linear-gradient(90deg, #3d7a4a, ${colors.greenPrimary}, ${colors.blue}, ${colors.greenPrimary}, #3d7a4a)`,
          }}
        />

        <Container
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            backgroundColor: colors.card,
          }}
        >
          {/* ═══ LOGO ═══ */}
          <Section style={{ padding: "48px 48px 0", textAlign: "center" as const }}>
            <Text
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: colors.white,
                letterSpacing: "-0.5px",
                margin: 0,
                fontFamily,
              }}
            >
              extendr
            </Text>
          </Section>

          {/* ═══ PILL BADGE ═══ */}
          <Section style={{ padding: "40px 48px 0", textAlign: "center" as const }}>
            <PillBadge>Now Live</PillBadge>
          </Section>

          {/* ═══ HERO HEADLINE ═══ */}
          <Section style={{ padding: "32px 48px 0", textAlign: "center" as const }}>
            <Heading
              as="h1"
              style={{
                margin: 0,
                fontSize: "48px",
                fontWeight: 800,
                color: colors.white,
                letterSpacing: "-1.5px",
                lineHeight: "56px",
                fontFamily,
              }}
            >
              What will you
              <br />
              <em style={{ fontStyle: "italic", color: colors.greenPrimary }}>
                build
              </em>{" "}
              today?
            </Heading>
          </Section>

          {/* ═══ HERO SUBTITLE ═══ */}
          <Section style={{ padding: "24px 64px 0", textAlign: "center" as const }}>
            <Text
              style={{
                margin: 0,
                fontSize: "17px",
                color: colors.textSecondary,
                lineHeight: "28px",
                fontWeight: 400,
                fontFamily,
              }}
            >
              extendr is live. Build Chrome extensions with AI, ship them to
              businesses, and turn your skills into recurring revenue.
            </Text>
          </Section>

          {/* ═══ HERO CTA ═══ */}
          <Section style={{ padding: "36px 48px 0", textAlign: "center" as const }}>
            <GreenButton href={ctaUrl}>Start Building →</GreenButton>
          </Section>

          {/* ═══ APP MOCKUP ═══ */}
          <Section style={{ padding: "56px 32px 0" }}>
            <table
              cellPadding="0"
              cellSpacing="0"
              border={0}
              role="presentation"
              width="100%"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* Browser bar */}
              <tr>
                <td
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${colors.borderSubtle}`,
                  }}
                >
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    role="presentation"
                    style={{ margin: "0 auto" }}
                    align="center"
                  >
                    <tr>
                      <td
                        style={{
                          padding: "4px 24px",
                          backgroundColor: "#12171e",
                          borderRadius: "6px",
                          fontSize: "11px",
                          color: colors.textDim,
                          fontFamily: monoFamily,
                        }}
                      >
                        extendr.dev/build
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              {/* App content */}
              <tr>
                <td style={{ padding: "24px" }}>
                  <Row>
                    {/* Chat side */}
                    <Column style={{ width: "55%", verticalAlign: "top", paddingRight: "16px" }}>
                      {/* User message */}
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        role="presentation"
                        width="100%"
                        style={{
                          backgroundColor: colors.greenMuted,
                          border: `1px solid ${colors.greenDark}`,
                          borderRadius: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <tr>
                          <td style={{ padding: "12px 14px" }}>
                            <Text
                              style={{
                                margin: "0 0 4px",
                                fontSize: "9px",
                                color: colors.greenPrimary,
                                fontWeight: 600,
                                textTransform: "uppercase" as const,
                                letterSpacing: "1px",
                                fontFamily,
                              }}
                            >
                              You
                            </Text>
                            <Text
                              style={{
                                margin: 0,
                                fontSize: "12px",
                                color: "#cccccc",
                                lineHeight: "18px",
                                fontFamily,
                              }}
                            >
                              "Build me a dark mode toggle for any website"
                            </Text>
                          </td>
                        </tr>
                      </table>

                      {/* AI response */}
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        role="presentation"
                        width="100%"
                        style={{
                          backgroundColor: "#10151b",
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: "12px",
                        }}
                      >
                        <tr>
                          <td style={{ padding: "12px 14px" }}>
                            <Text
                              style={{
                                margin: "0 0 4px",
                                fontSize: "9px",
                                color: colors.blue,
                                fontWeight: 600,
                                textTransform: "uppercase" as const,
                                letterSpacing: "1px",
                                fontFamily,
                              }}
                            >
                              Extendr AI
                            </Text>
                            <Text
                              style={{
                                margin: "0 0 8px",
                                fontSize: "12px",
                                color: "#999999",
                                lineHeight: "18px",
                                fontFamily,
                              }}
                            >
                              Creating your extension...
                            </Text>
                            <table
                              cellPadding="0"
                              cellSpacing="0"
                              border={0}
                              role="presentation"
                            >
                              <FileRow name="manifest.json" color={colors.greenPrimary} />
                              <FileRow name="popup.html" color={colors.greenPrimary} />
                              <FileRow name="content.js" color="#e8a838" />
                              <FileRow name="styles.css" color="#333333" />
                            </table>
                          </td>
                        </tr>
                      </table>
                    </Column>

                    {/* Preview side */}
                    <Column style={{ width: "45%", verticalAlign: "top" }}>
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        role="presentation"
                        width="100%"
                        style={{
                          backgroundColor: "#0e1219",
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "8px 12px",
                              borderBottom: `1px solid #12171e`,
                            }}
                          >
                            <Text
                              style={{
                                margin: 0,
                                fontSize: "9px",
                                color: colors.greenPrimary,
                                fontWeight: 600,
                                textTransform: "uppercase" as const,
                                letterSpacing: "1px",
                                fontFamily,
                              }}
                            >
                              Live Preview
                            </Text>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              padding: "16px",
                              textAlign: "center" as const,
                            }}
                          >
                            {/* Moon icon */}
                            <table
                              cellPadding="0"
                              cellSpacing="0"
                              border={0}
                              role="presentation"
                              style={{ margin: "0 auto 12px" }}
                              align="center"
                            >
                              <tr>
                                <td
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    backgroundColor: colors.greenDark,
                                    border: `1px solid #1f3222`,
                                    textAlign: "center" as const,
                                    fontSize: "16px",
                                    lineHeight: "36px",
                                  }}
                                  width="36"
                                  height="36"
                                >
                                  ☽
                                </td>
                              </tr>
                            </table>
                            <Text
                              style={{
                                margin: "0 0 4px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#dddddd",
                                fontFamily,
                              }}
                            >
                              Dark Mode
                            </Text>
                            <Text
                              style={{
                                margin: "0 0 12px",
                                fontSize: "10px",
                                color: colors.textMuted,
                                fontFamily,
                              }}
                            >
                              Toggle for any site
                            </Text>
                            {/* Toggle switch */}
                            <table
                              cellPadding="0"
                              cellSpacing="0"
                              border={0}
                              role="presentation"
                              style={{
                                margin: "0 auto",
                                backgroundColor: colors.greenPrimary,
                                borderRadius: "10px",
                                width: "40px",
                                height: "20px",
                              }}
                              align="center"
                              width="40"
                              height="20"
                            >
                              <tr>
                                <td width="6" style={{ fontSize: "0" }}>
                                  &nbsp;
                                </td>
                                <td width="14" style={{ fontSize: "0" }}>
                                  &nbsp;
                                </td>
                                <td
                                  width="16"
                                  style={{
                                    verticalAlign: "middle",
                                    fontSize: "0",
                                    lineHeight: "0",
                                  }}
                                >
                                  <table
                                    cellPadding="0"
                                    cellSpacing="0"
                                    border={0}
                                    role="presentation"
                                  >
                                    <tr>
                                      <td
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                          borderRadius: "50%",
                                          backgroundColor: colors.white,
                                          fontSize: "0",
                                          lineHeight: "0",
                                        }}
                                        width="14"
                                        height="14"
                                      >
                                        &nbsp;
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                                <td width="4" style={{ fontSize: "0" }}>
                                  &nbsp;
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </Column>
                  </Row>
                </td>
              </tr>
            </table>
          </Section>

          {/* ═══ DIVIDER ═══ */}
          <Section style={{ padding: "72px 48px 0" }}>
            <Hr style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: 0 }} />
          </Section>

          {/* ═══ FEATURE 1: Vibe code in seconds ═══ */}
          <Section style={{ padding: "56px 48px 0" }}>
            <Row>
              <Column style={{ width: "55%", verticalAlign: "top", paddingRight: "24px" }}>
                <SectionLabel>AI-Powered</SectionLabel>
                <Heading
                  as="h2"
                  style={{
                    margin: "0 0 16px",
                    fontSize: "28px",
                    fontWeight: 800,
                    color: colors.white,
                    lineHeight: "36px",
                    letterSpacing: "-0.5px",
                    fontFamily,
                  }}
                >
                  <span style={{ color: colors.greenPrimary }}>Vibe code</span>{" "}
                  in seconds
                </Heading>
                <Text
                  style={{
                    margin: "0 0 24px",
                    fontSize: "15px",
                    color: colors.textSecondary,
                    lineHeight: "25px",
                    fontFamily,
                  }}
                >
                  Describe a workflow, get a working Chrome extension. No
                  boilerplate, no setup hell. Just tell the AI what you want and
                  watch it build.
                </Text>
                <OutlineButton href={ctaUrl}>Try it free →</OutlineButton>
              </Column>
              <Column style={{ width: "45%", verticalAlign: "top" }}>
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  role="presentation"
                  width="100%"
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "14px",
                  }}
                >
                  <tr>
                    <td style={{ padding: "20px" }}>
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        role="presentation"
                        style={{ marginBottom: "12px" }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              backgroundColor: colors.greenMuted,
                              border: `1px solid ${colors.greenDark}`,
                              fontSize: "10px",
                              fontWeight: 600,
                              color: colors.greenPrimary,
                              textTransform: "uppercase" as const,
                              letterSpacing: "1px",
                              fontFamily,
                            }}
                          >
                            15+ AI Tools
                          </td>
                        </tr>
                      </table>
                      <Text
                        style={{
                          margin: 0,
                          fontFamily: monoFamily,
                          fontSize: "11px",
                          lineHeight: "20px",
                          color: colors.textDim,
                        }}
                      >
                        <span style={{ color: colors.greenPrimary }}>create</span>{" "}
                        <span style={{ color: colors.blue }}>manifest.json</span>
                        <br />
                        <span style={{ color: colors.greenPrimary }}>write</span>{" "}
                        <span style={{ color: colors.blue }}>popup.html</span>
                        <br />
                        <span style={{ color: colors.greenPrimary }}>write</span>{" "}
                        <span style={{ color: colors.blue }}>background.js</span>
                        <br />
                        <span style={{ color: colors.greenPrimary }}>style</span>{" "}
                        <span style={{ color: colors.blue }}>content.css</span>
                        <br />
                        <span style={{ color: colors.greenPrimary }}>preview</span>{" "}
                        <span style={{ color: colors.blue }}>extension</span>
                        <br />
                        <span style={{ color: colors.textSecondary }}>
                          ✓ Done in 30s
                        </span>
                      </Text>
                    </td>
                  </tr>
                </table>
              </Column>
            </Row>
          </Section>

          {/* ═══ FEATURE 2: Sell directly ═══ */}
          <Section style={{ padding: "64px 48px 0" }}>
            <Row>
              <Column style={{ width: "45%", verticalAlign: "top", paddingRight: "24px" }}>
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  role="presentation"
                  width="100%"
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "14px",
                  }}
                >
                  <tr>
                    <td style={{ padding: "20px" }}>
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        role="presentation"
                        style={{ marginBottom: "16px" }}
                      >
                        <tr>
                          <td
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              backgroundColor: colors.blueDark,
                              border: `1px solid #1a262d`,
                              fontSize: "10px",
                              fontWeight: 600,
                              color: colors.blue,
                              textTransform: "uppercase" as const,
                              letterSpacing: "1px",
                              fontFamily,
                            }}
                          >
                            Marketplace
                          </td>
                        </tr>
                      </table>
                      {/* Mock listings */}
                      {[
                        { name: "Tab Manager Pro", desc: "Groups tabs by topic automatically", price: "$12/mo" },
                        { name: "Form Filler AI", desc: "Auto-fills business forms with AI", price: "$8/mo" },
                      ].map((item, i) => (
                        <table
                          key={i}
                          cellPadding="0"
                          cellSpacing="0"
                          border={0}
                          role="presentation"
                          width="100%"
                          style={{
                            backgroundColor: "#0e1219",
                            border: `1px solid ${colors.borderSubtle}`,
                            borderRadius: "10px",
                            marginBottom: i === 0 ? "10px" : "0",
                          }}
                        >
                          <tr>
                            <td style={{ padding: "14px" }}>
                              <Text style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "#dddddd", fontFamily }}>{item.name}</Text>
                              <Text style={{ margin: "0 0 8px", fontSize: "11px", color: colors.textMuted, fontFamily }}>{item.desc}</Text>
                              <Text style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: colors.greenPrimary, fontFamily }}>{item.price}</Text>
                            </td>
                          </tr>
                        </table>
                      ))}
                    </td>
                  </tr>
                </table>
              </Column>
              <Column style={{ width: "55%", verticalAlign: "top" }}>
                <SectionLabel>Marketplace</SectionLabel>
                <Heading
                  as="h2"
                  style={{
                    margin: "0 0 16px",
                    fontSize: "28px",
                    fontWeight: 800,
                    color: colors.white,
                    lineHeight: "36px",
                    letterSpacing: "-0.5px",
                    fontFamily,
                  }}
                >
                  <span style={{ color: colors.blue }}>Sell directly</span> to
                  businesses
                </Heading>
                <Text
                  style={{
                    margin: "0 0 24px",
                    fontSize: "15px",
                    color: colors.textSecondary,
                    lineHeight: "25px",
                    fontFamily,
                  }}
                >
                  List your extension and connect with businesses that pay real
                  money for tools that save them time. No app store middlemen.
                </Text>
                <OutlineButton href={ctaUrl}>
                  Explore Marketplace →
                </OutlineButton>
              </Column>
            </Row>
          </Section>

          {/* ═══ FEATURE 3: Own your revenue ═══ */}
          <Section style={{ padding: "64px 48px 0" }}>
            <Row>
              <Column style={{ width: "55%", verticalAlign: "top", paddingRight: "24px" }}>
                <SectionLabel>Revenue</SectionLabel>
                <Heading
                  as="h2"
                  style={{
                    margin: "0 0 16px",
                    fontSize: "28px",
                    fontWeight: 800,
                    color: colors.white,
                    lineHeight: "36px",
                    letterSpacing: "-0.5px",
                    fontFamily,
                  }}
                >
                  Own your{" "}
                  <span style={{ color: colors.greenPrimary }}>
                    revenue stream
                  </span>
                </Heading>
                <Text
                  style={{
                    margin: "0 0 24px",
                    fontSize: "15px",
                    color: colors.textSecondary,
                    lineHeight: "25px",
                    fontFamily,
                  }}
                >
                  Your product, your customers, your money. No middlemen taking
                  a cut of your work. Keep what you earn.
                </Text>
                <OutlineButton href={ctaUrl}>Learn More →</OutlineButton>
              </Column>
              <Column style={{ width: "45%", verticalAlign: "top" }}>
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  role="presentation"
                  width="100%"
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "14px",
                  }}
                >
                  <tr>
                    <td style={{ padding: "20px" }}>
                      <Text
                        style={{
                          margin: "0 0 4px",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: colors.textMuted,
                          textTransform: "uppercase" as const,
                          letterSpacing: "1px",
                          fontFamily,
                        }}
                      >
                        This Month
                      </Text>
                      <Text
                        style={{
                          margin: "0 0 16px",
                          fontSize: "28px",
                          fontWeight: 800,
                          color: colors.greenPrimary,
                          letterSpacing: "-1px",
                          fontFamily,
                        }}
                      >
                        $2,840
                      </Text>
                      {/* Bar chart */}
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        role="presentation"
                        width="100%"
                        style={{ marginBottom: "8px" }}
                      >
                        <tr>
                          {[
                            { h: 25, c: "#1f3222" },
                            { h: 35, c: "#2b462e" },
                            { h: 28, c: "#1f3222" },
                            { h: 45, c: "#365a3a" },
                            { h: 52, c: "#3c6440" },
                            { h: 60, c: colors.greenPrimary },
                          ].map((bar, i) => (
                            <td
                              key={i}
                              style={{
                                verticalAlign: "bottom",
                                paddingRight: i < 5 ? "4px" : "0",
                                height: "60px",
                              }}
                            >
                              <table
                                cellPadding="0"
                                cellSpacing="0"
                                border={0}
                                role="presentation"
                                width="100%"
                              >
                                <tr>
                                  <td
                                    style={{
                                      height: `${bar.h}px`,
                                      backgroundColor: bar.c,
                                      borderRadius: "4px 4px 0 0",
                                      fontSize: "0",
                                      lineHeight: "0",
                                    }}
                                    height={bar.h}
                                  >
                                    &nbsp;
                                  </td>
                                </tr>
                              </table>
                            </td>
                          ))}
                        </tr>
                      </table>
                      <table
                        cellPadding="0"
                        cellSpacing="0"
                        border={0}
                        role="presentation"
                        width="100%"
                      >
                        <tr>
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                            (m, i) => (
                              <td
                                key={m}
                                style={{
                                  fontSize: "10px",
                                  color:
                                    i === 5
                                      ? colors.greenPrimary
                                      : colors.textDim,
                                  fontWeight: i === 5 ? 600 : 400,
                                  fontFamily,
                                }}
                              >
                                {m}
                              </td>
                            )
                          )}
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </Column>
            </Row>
          </Section>

          {/* ═══ DIVIDER ═══ */}
          <Section style={{ padding: "72px 48px 0" }}>
            <Hr style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: 0 }} />
          </Section>

          {/* ═══ SOCIAL PROOF ═══ */}
          <Section style={{ padding: "56px 48px 0", textAlign: "center" as const }}>
            <table cellPadding="0" cellSpacing="0" border={0} role="presentation" style={{ margin: "0 auto 16px" }}>
              <tr>
                <td style={{ padding: "6px 14px", borderRadius: "6px", border: `1px solid ${colors.border}`, backgroundColor: "#10151b", fontFamily }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#999999", textTransform: "uppercase" as const, letterSpacing: "2px", fontFamily }}>Early Builders</span>
                </td>
              </tr>
            </table>
            <Heading
              as="h2"
              style={{
                margin: "0 0 40px",
                fontSize: "30px",
                fontWeight: 800,
                color: colors.white,
                lineHeight: "38px",
                letterSpacing: "-0.5px",
                fontFamily,
              }}
            >
              What people are{" "}
              <span
                style={{
                  color: colors.greenPrimary,
                  fontStyle: "italic",
                }}
              >
                already building
              </span>
            </Heading>
          </Section>

          <Section style={{ padding: "0 48px" }}>
            <Row>
              {[
                {
                  name: "SaaSFlow",
                  quote: '"Built a lead capture extension in 20 minutes. Already making $400/mo."',
                  desc: "A solo founder using Extendr to build and sell browser tools to small agencies.",
                },
                {
                  name: "DesignLab",
                  quote: '"We replaced 3 internal tools with one custom extension."',
                  desc: "A design agency that built a client portal extension to streamline feedback.",
                },
              ].map((t, i) => (
                <Column
                  key={i}
                  style={{
                    width: "50%",
                    verticalAlign: "top",
                    paddingRight: i === 0 ? "12px" : "0",
                    paddingLeft: i === 1 ? "12px" : "0",
                  }}
                >
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    role="presentation"
                    width="100%"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "14px",
                    }}
                  >
                    <tr>
                      <td style={{ padding: "24px" }}>
                        <Text style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: colors.white, fontFamily }}>{t.name}</Text>
                        <Text style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600, color: "#cccccc", lineHeight: "22px", fontFamily }}>{t.quote}</Text>
                        <Text style={{ margin: "0 0 16px", fontSize: "13px", color: "#777777", lineHeight: "21px", fontFamily }}>{t.desc}</Text>
                        <Text style={{ margin: 0, fontSize: "16px", color: colors.greenPrimary, fontFamily }}>★★★★★</Text>
                      </td>
                    </tr>
                  </table>
                </Column>
              ))}
            </Row>
          </Section>
        </Container>

        {/* ═══ DARK CTA BAND ═══ */}
        <Section
          style={{
            height: "4px",
            background: `linear-gradient(90deg, #3d7a4a, ${colors.greenPrimary}, ${colors.blue}, ${colors.greenPrimary}, #3d7a4a)`,
            marginTop: "72px",
          }}
        />
        <Container
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            backgroundColor: colors.bg,
            padding: "64px 48px",
            textAlign: "center" as const,
          }}
        >
          <PillBadge>Waitlist Exclusive</PillBadge>

          <Heading
            as="h2"
            style={{
              margin: "16px 0 12px",
              fontSize: "30px",
              fontWeight: 800,
              color: colors.white,
              lineHeight: "38px",
              letterSpacing: "-0.5px",
              fontFamily,
            }}
          >
            You're early. Here's{" "}
            <span style={{ color: colors.greenPrimary }}>20% off</span>
          </Heading>

          <Text
            style={{
              margin: "0 0 32px",
              fontSize: "16px",
              color: "#777777",
              lineHeight: "24px",
              fontFamily,
            }}
          >
            Use this code on your first plan. First 100 waitlist members only.
          </Text>

          {/* Coupon code */}
          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            role="presentation"
            style={{ margin: "0 auto 36px" }}
            align="center"
          >
            <tr>
              <td
                style={{
                  padding: "18px 48px",
                  border: `2px dashed #305034`,
                  borderRadius: "14px",
                  backgroundColor: "#0c120e",
                }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: colors.greenPrimary,
                    letterSpacing: "8px",
                    fontFamily: monoFamily,
                  }}
                >
                  LAUNCH20
                </span>
              </td>
            </tr>
          </table>

          <GreenButton href={ctaUrl}>Claim Your Spot →</GreenButton>

          <Text
            style={{
              margin: "12px 0 0",
              fontSize: "12px",
              color: colors.textFaint,
              fontFamily,
            }}
          >
            Free to start · No credit card required
          </Text>
        </Container>

        <Section
          style={{
            height: "4px",
            background: `linear-gradient(90deg, #3d7a4a, ${colors.greenPrimary}, ${colors.blue}, ${colors.greenPrimary}, #3d7a4a)`,
          }}
        />

        {/* ═══ HOW IT WORKS ═══ */}
        <Container
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            backgroundColor: colors.card,
            padding: "64px 48px 0",
          }}
        >
          <Section style={{ textAlign: "center" as const, marginBottom: "40px" }}>
            <table cellPadding="0" cellSpacing="0" border={0} role="presentation" style={{ margin: "0 auto 16px" }}>
              <tr>
                <td style={{ padding: "6px 14px", borderRadius: "6px", border: `1px solid ${colors.border}`, backgroundColor: "#10151b", fontFamily }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#999999", textTransform: "uppercase" as const, letterSpacing: "2px", fontFamily }}>How It Works</span>
                </td>
              </tr>
            </table>
            <Heading
              as="h2"
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 800,
                color: colors.white,
                lineHeight: "38px",
                letterSpacing: "-0.5px",
                fontFamily,
              }}
            >
              Three steps to{" "}
              <span
                style={{
                  color: colors.greenPrimary,
                  fontStyle: "italic",
                }}
              >
                your first extension
              </span>
            </Heading>
          </Section>

          <Row>
            {[
              { num: "1", title: "Describe", desc: "Tell the AI what extension you want in plain English.", gradient: `linear-gradient(135deg, ${colors.greenPrimary}, ${colors.blue})` },
              { num: "2", title: "Watch it build", desc: "AI generates all files with live preview in real-time.", gradient: `linear-gradient(135deg, ${colors.blue}, #98c1da)` },
              { num: "3", title: "Ship it", desc: "Download, install in Chrome, or sell on the marketplace.", gradient: `linear-gradient(135deg, ${colors.greenPrimary}, #22C55E)` },
            ].map((step, i) => (
              <Column
                key={i}
                style={{
                  width: "33.33%",
                  verticalAlign: "top",
                  textAlign: "center" as const,
                  paddingRight: i < 2 ? "12px" : "0",
                  paddingLeft: i > 0 ? "6px" : "0",
                }}
              >
                <StepCircle num={step.num} gradient={step.gradient} />
                <Text style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700, color: colors.white, fontFamily }}>{step.title}</Text>
                <Text style={{ margin: 0, fontSize: "13px", color: "#777777", lineHeight: "20px", fontFamily }}>{step.desc}</Text>
              </Column>
            ))}
          </Row>
        </Container>

        {/* ═══ FOUNDER SIGN-OFF ═══ */}
        <Container
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            backgroundColor: colors.card,
            padding: "64px 48px 0",
          }}
        >
          <Hr style={{ borderTop: `1px solid ${colors.borderSubtle}`, margin: "0 0 48px" }} />

          <Text
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              color: colors.textSecondary,
              lineHeight: "25px",
              fontStyle: "italic",
              fontFamily,
            }}
          >
            "Thank you for believing in what we're building before it existed.
            You took a chance on an idea — and we built it for people exactly
            like you."
          </Text>
          <Text
            style={{
              margin: "0 0 24px",
              fontSize: "14px",
              color: "#777777",
              lineHeight: "22px",
              fontFamily,
            }}
          >
            If you have any questions, just reply to this email. I read every
            one.
          </Text>

          <Row>
            <Column style={{ width: "58px", verticalAlign: "middle" }}>
              <table cellPadding="0" cellSpacing="0" border={0} role="presentation">
                <tr>
                  <td
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${colors.greenPrimary}, ${colors.blue})`,
                      textAlign: "center" as const,
                      lineHeight: "44px",
                      fontSize: "18px",
                      color: colors.white,
                      fontWeight: 700,
                      fontFamily,
                    }}
                    width="44"
                    height="44"
                  >
                    E
                  </td>
                </tr>
              </table>
            </Column>
            <Column style={{ verticalAlign: "middle" }}>
              <Text style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e0e0e0", lineHeight: "20px", fontFamily }}>The Extendr Team</Text>
              <Text style={{ margin: "2px 0 0", fontSize: "12px", color: colors.textDim, lineHeight: "16px", fontFamily }}>Building the future of Chrome extensions</Text>
            </Column>
          </Row>
        </Container>

        {/* ═══ FOOTER ═══ */}
        <Container
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            backgroundColor: colors.card,
            padding: "48px 48px 40px",
          }}
        >
          <Hr style={{ borderTop: `1px solid #12171e`, margin: "0 0 32px" }} />

          <Row>
            <Column style={{ verticalAlign: "middle" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: colors.textFaint,
                  letterSpacing: "-0.3px",
                  fontFamily,
                }}
              >
                extendr
              </Text>
            </Column>
            <Column style={{ textAlign: "right" as const, verticalAlign: "middle" }}>
            </Column>
          </Row>

          <Text
            style={{
              margin: "16px 0 0",
              fontSize: "10px",
              color: "#333333",
              lineHeight: "16px",
              textAlign: "center" as const,
              fontFamily,
            }}
          >
            <span style={{ color: colors.greenPrimary }}>extendr.dev</span>
            {" · "}
            <span style={{ color: colors.textFaint }}>hi@extendr.dev</span>
          </Text>
          <Text
            style={{
              margin: "8px 0 0",
              fontSize: "10px",
              color: "#222222",
              lineHeight: "14px",
              textAlign: "center" as const,
              fontFamily,
            }}
          >
            © 2026 Extendr. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

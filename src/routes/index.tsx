import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Search,
  BarChart3,
  ShieldCheck,
  Lock,
  Languages,
  Scale,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 flex justify-center">
                <LanguageSwitcher />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                {t("app_name")}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">{t("tagline")}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-14 w-full px-8 text-base sm:w-auto">
                  <Link to="/report">
                    <FileText className="mr-2 h-5 w-5" />
                    {t("report_now")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 w-full px-8 text-base sm:w-auto"
                >
                  <Link to="/track">
                    <Search className="mr-2 h-5 w-5" />
                    {t("track_report")}
                  </Link>
                </Button>
              </div>
              <div className="mt-4">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/stats">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t("public_stats")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-border bg-card/50">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-3">
            <FeatureCard
              icon={<Lock className="h-5 w-5" />}
              title="Anonymous by default"
              text="You can report without creating an account. Provide contact only if you wish."
            />
            <FeatureCard
              icon={<Languages className="h-5 w-5" />}
              title="Five languages"
              text="Mandinka, Wolof, Fula, Jola, and English — voice notes are auto-transcribed."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Routed to authorities"
              text="Reports go to the Police or Department of Women & Children Welfare."
            />
          </div>
        </section>

        {/* Persistent child rights issues */}
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              The situation today
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Persistent child rights issues in The Gambia
            </h2>
            <p className="mt-3 text-muted-foreground">
              Despite progress, harmful practices and gaps in protection continue to affect
              thousands of children every year. The figures below are drawn from publicly
              available national and international sources.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            <IssueCard
              stat="73%"
              title="Female genital mutilation (FGM)"
              text="Of women aged 15–49 have undergone FGM. The majority were cut before age five. The practice was criminalised in 2015, but enforcement remains limited."
              source="UNICEF / MICS 2018; Thomson Reuters Foundation Gambia Law Report (2018)"
              href="https://www.unicef.org/gambia/reports/gambia-multiple-indicator-cluster-survey-2018"
            />
            <IssueCard
              stat="23%"
              title="Child marriage"
              text="Of women aged 20–24 were married before their 18th birthday; about 6% before age 15 — roughly 264,000 women and girls affected nationwide."
              source="UNICEF Child Marriage Data Portal (2024)"
              href="https://childmarriagedata.org/country-profiles/gambia/"
            />
            <IssueCard
              stat="High"
              title="Child labour"
              text="Children in The Gambia engage in the worst forms of child labour, including in agriculture (groundnuts, rice), street vending, and commercial sexual exploitation linked to tourism."
              source="U.S. Department of Labor — Findings on the Worst Forms of Child Labor"
              href="https://www.dol.gov/agencies/ilab/resources/reports/child-labor/gambia"
            />
            <IssueCard
              stat="1 in 5"
              title="Out-of-school & unsafe schools"
              text="Roughly one in five primary-age children are out of school, and corporal punishment, bullying and unsafe routes to school remain widely reported."
              source="UNICEF The Gambia — Education programme overview"
              href="https://www.unicef.org/gambia/what-we-do"
            />
            <IssueCard
              stat="Underreported"
              title="Violence, abuse & neglect"
              text="Physical and sexual violence against children is significantly underreported due to stigma, fear of reprisal, and limited access to confidential reporting channels — which this platform exists to address."
              source="UNICEF Gambia — Child Protection"
              href="https://www.unicef.org/gambia/what-we-do"
            />
            <IssueCard
              stat="Rising"
              title="Trafficking & migration risks"
              text="Children are trafficked internally and across the region for forced begging (almudo / talibé), domestic servitude, and sexual exploitation."
              source="U.S. Department of State — Trafficking in Persons Report"
              href="https://www.state.gov/reports/2024-trafficking-in-persons-report/the-gambia/"
            />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Figures are indicative; consult the linked sources for full methodology and the most
            recent updates.
          </p>
        </section>

        {/* Legal frameworks */}
        <section className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Scale className="h-3.5 w-3.5" />
                Legal protections
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Laws that protect children
              </h2>
              <p className="mt-3 text-muted-foreground">
                Children in The Gambia are protected by a layered framework of national,
                regional and international law. Reporting an issue helps these protections work
                in practice.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <LegalGroup
                title="National (The Gambia)"
                items={[
                  {
                    name: "Children's Act, 2005",
                    text: "Domesticates the UN Convention on the Rights of the Child. Defines a child as anyone under 18, prohibits child labour, abuse, harmful traditional practices and child marriage, and creates Children's Courts.",
                    href: "https://www.lawhubgambia.com/lawhug-net",
                  },
                  {
                    name: "Women's Act, 2010 & Amendment Act, 2015",
                    text: "Criminalises female genital mutilation (FGM) with prison terms of up to three years, and life imprisonment if FGM causes a child's death.",
                    href: "https://www.lawhubgambia.com/lawhug-net/2020/12/3-fgm-and-the-law",
                  },
                  {
                    name: "Trafficking in Persons Act, 2007",
                    text: "Criminalises trafficking of children and adults and provides for victim protection and rehabilitation.",
                    href: "https://www.refworld.org/",
                  },
                  {
                    name: "Sexual Offences Act & Domestic Violence Act, 2013",
                    text: "Strengthen protection from sexual abuse, exploitation and violence in the home — including offences specific to child victims.",
                    href: "https://www.lawhubgambia.com/lawhug-net",
                  },
                  {
                    name: "Constitution of The Gambia, 1997",
                    text: "Section 29 protects children from economic and social exploitation and from work that is hazardous, harmful, or interferes with their education.",
                    href: "https://www.constituteproject.org/constitution/Gambia_2018",
                  },
                ]}
              />
              <LegalGroup
                title="Regional (Africa)"
                items={[
                  {
                    name: "African Charter on the Rights and Welfare of the Child (ACRWC), 1990",
                    text: "Ratified by The Gambia in 2000. Sets continent-wide standards on survival, development, protection and participation, and prohibits harmful social and cultural practices.",
                    href: "https://au.int/en/treaties/african-charter-rights-and-welfare-child",
                  },
                  {
                    name: "Maputo Protocol, 2003",
                    text: "Protocol to the African Charter on Human and Peoples' Rights on the Rights of Women in Africa. Article 5 explicitly requires States to prohibit and condemn FGM and all forms of harmful practices.",
                    href: "https://au.int/en/treaties/protocol-african-charter-human-and-peoples-rights-rights-women-africa",
                  },
                  {
                    name: "ECOWAS instruments on trafficking & child protection",
                    text: "Regional plans of action on trafficking in persons and on the protection of children on the move that bind The Gambia as an ECOWAS member state.",
                    href: "https://ecowas.int/",
                  },
                ]}
              />
              <LegalGroup
                title="International (UN)"
                items={[
                  {
                    name: "UN Convention on the Rights of the Child (CRC), 1989",
                    text: "Ratified by The Gambia in 1990. The foundational global treaty on child rights — survival, development, protection from violence and exploitation, and the right to be heard.",
                    href: "https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-child",
                  },
                  {
                    name: "Optional Protocols to the CRC",
                    text: "On the sale of children, child prostitution and child pornography, and on the involvement of children in armed conflict.",
                    href: "https://www.ohchr.org/en/instruments-mechanisms/instruments/optional-protocol-convention-rights-child-sale-children-child",
                  },
                  {
                    name: "ILO Convention No. 182",
                    text: "Worst Forms of Child Labour Convention — ratified by The Gambia. Requires immediate action to eliminate slavery, trafficking, hazardous work and commercial sexual exploitation of children.",
                    href: "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_ILO_CODE:C182",
                  },
                  {
                    name: "Convention on the Elimination of All Forms of Discrimination Against Women (CEDAW), 1979",
                    text: "Ratified by The Gambia in 1993. Protects girls from discrimination in education, health and family life.",
                    href: "https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-elimination-all-forms-discrimination-against-women",
                  },
                ]}
              />
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              This summary is for awareness only and is not legal advice. For case-specific
              guidance, contact the Department of Social Welfare, the Police Child Welfare Unit,
              or a qualified legal practitioner.
            </p>
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-muted-foreground">
          <Link to="/staff/login" className="underline-offset-4 hover:underline">
            {t("staff_login")}
          </Link>
        </footer>
      </main>
    </div>
  );
}

function IssueCard({
  stat,
  title,
  text,
  source,
  href,
}: {
  stat: string;
  title: string;
  text: string;
  source: string;
  href: string;
}) {
  return (
    <Card className="flex flex-col p-6">
      <div className="text-3xl font-bold text-primary">{stat}</div>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        Source: {source}
        <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  );
}

function LegalGroup({
  title,
  items,
}: {
  title: string;
  items: { name: string; text: string; href: string }[];
}) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-4">
        {items.map((it) => (
          <li key={it.name} className="border-l-2 border-primary/40 pl-3">
            <a
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1 text-sm font-medium text-foreground hover:text-primary"
            >
              {it.name}
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
            </a>
            <p className="mt-1 text-xs text-muted-foreground">{it.text}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </Card>
  );
}

import type { Metadata } from "next";
import { getAssociationInfo } from "@/lib/data";
import { terms } from "@/config/terms";
import { Card, CardBody, Container, PageIntro, Section } from "@/components/ui";

const DESCRIPTION = `Om ${terms.groupDefinite} och ${terms.associationGenitive} gemensamma anläggningar.`;

export const metadata: Metadata = {
  title: terms.GroupDefinite,
  description: DESCRIPTION,
};

/**
 * EkoSam: sidan om området (BrfStart: Fastigheten). Den visar fälten ur
 * Föreningsinfo som gäller en samfällighet och hoppar över det som inte är
 * ifyllt. Uppvärmning, tvätt, energiklass och mark gäller varje fastighet för
 * sig och visas inte.
 */
export default async function FastighetenPage() {
  const info = await getAssociationInfo();

  const facts = [
    { label: "Bildad", value: info.builtYear ? String(info.builtYear) : "" },
    {
      label: `Antal ${terms.units}`,
      value: info.apartments ? String(info.apartments) : "",
    },
    { label: "Gemensamma anläggningar", value: info.commonAreas },
    { label: "Parkering", value: info.parking },
    { label: "Bredband och TV", value: info.broadband },
  ].filter((f) => f.value);

  return (
    <Section>
      <Container>
        <PageIntro
          eyebrow="Om föreningen"
          title={terms.GroupDefinite}
          description={DESCRIPTION}
        />

        <div className="mt-12 max-w-2xl space-y-8">
          {facts.length === 0 ? (
            <Card>
              <CardBody className="py-6 text-sm text-muted">
                Styrelsen har inte fyllt i uppgifter om {terms.groupDefinite} ännu.
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <dl className="divide-y divide-border">
                  {facts.map((f) => (
                    <div
                      key={f.label}
                      className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4"
                    >
                      <dt className="text-sm font-medium text-muted">
                        {f.label}
                      </dt>
                      <dd className="text-sm text-foreground sm:col-span-2">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>
          )}

          {info.renovationsDone.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="title-card">Genomfört underhåll</h2>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground">
                  {info.renovationsDone.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-moss">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

"use client";

import { sendGAEvent } from "@next/third-parties/google";

interface Phone {
  id: number;
  number: string;
  isPrimary: boolean;
  isWhatsApp: boolean;
}

interface ContactButtonsProps {
  phones: Phone[];
  carSlug: string;
  carTitle: string;
}

export function ContactButtons({ phones, carSlug, carTitle }: ContactButtonsProps) {
  if (phones.length === 0) return null;

  return (
    <ul className="mt-3 flex flex-col gap-2">
      {phones.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:+94${p.number}`}
            onClick={() =>
              sendGAEvent("event", "contact_call", {
                car_slug: carSlug,
                car_title: carTitle,
              })
            }
            className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            +94 {p.number}
          </a>
          {p.isPrimary && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
              Primary
            </span>
          )}
          {p.isWhatsApp && (
            <a
              href={`https://wa.me/94${p.number}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                sendGAEvent("event", "contact_whatsapp", {
                  car_slug: carSlug,
                  car_title: carTitle,
                })
              }
              className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200"
            >
              WhatsApp
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

interface StickyContactCTAProps {
  phones: Phone[];
  carSlug: string;
  carTitle: string;
}

export function StickyContactCTA({ phones, carSlug, carTitle }: StickyContactCTAProps) {
  if (phones.length === 0) return null;

  const primary = phones.find((p) => p.isPrimary) ?? phones[0];
  const whatsapp = phones.find((p) => p.isWhatsApp);

  return (
    <div
      className="fixed inset-x-0 z-40 bg-background/90 px-4 pt-2 pb-1 shadow-[0_-1px_0_0_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
      style={{ bottom: "calc(56px + env(safe-area-inset-bottom))" }}
    >
      <div className="flex gap-2">
        <a
          href={`tel:+94${primary.number}`}
          onClick={() =>
            sendGAEvent("event", "contact_call", {
              car_slug: carSlug,
              car_title: carTitle,
              source: "sticky_cta",
            })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white active:bg-primary-800"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          Call — +94 {primary.number}
        </a>
        {whatsapp && (
          <a
            href={`https://wa.me/94${whatsapp.number}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              sendGAEvent("event", "contact_whatsapp", {
                car_slug: carSlug,
                car_title: carTitle,
                source: "sticky_cta",
              })
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white active:bg-green-700"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

import "./service-rows.css";

/*
  Two rows between the main map and Contact (desk: docs/design/desk-flow-rows.html). Every block is a main map pill
  node, one size. Services are told as small flows, one node per word, each service in its own outlined box. Get
  started is one connected process. Contact below belongs to its form and is not wired to these. Pure CSS motion:
  one dot per wire in the colour of the node it leaves; with reduced motion the dots rest mid wire.
*/

type Tone = { c: string; ink?: boolean };

const ORANGE: Tone = { c: "var(--orange)", ink: true };

const ICON = {
  flow: (
    <>
      <circle cx="3.5" cy="8" r="1.8" />
      <circle cx="12.5" cy="4" r="1.8" />
      <circle cx="12.5" cy="12" r="1.8" />
      <path d="M5.3 8h2.5M7.8 8l2.9-3.4M7.8 8l2.9 3.4" />
    </>
  ),
  build: <path d="M10.5 2.5a3 3 0 0 0-3.7 3.9L2.5 10.7v2.8h2.8l4.3-4.3a3 3 0 0 0 3.9-3.7l-1.9 1.9-1.8-.5-.5-1.8Z" />,
  cloud: <path d="M4.5 12.5a3 3 0 0 1-.3-6 4 4 0 0 1 7.6-.8 3.2 3.2 0 0 1 .2 6.8Z" />,
  server: (
    <>
      <rect x="3" y="2.5" width="10" height="4.5" rx="1" />
      <rect x="3" y="9" width="10" height="4.5" rx="1" />
      <path d="M5.5 4.75h.01M5.5 11.25h.01" />
    </>
  ),
  parcel: <path d="M8 1.8 13.5 4.6v6.8L8 14.2 2.5 11.4V4.6ZM2.5 4.6 8 7.4l5.5-2.8M8 7.4v6.8M5.2 3.2l5.5 2.8" />,
  spark: <path d="M8 2.5 9.3 6.7 13.5 8 9.3 9.3 8 13.5 6.7 9.3 2.5 8 6.7 6.7Z" />,
  turn: <path d="M12.5 6A4.8 4.8 0 0 0 3.6 5M3.5 10a4.8 4.8 0 0 0 8.9 1M3.5 2.5V5H6M12.5 13.5V11H10" />,
  list: <path d="M6 4h7.5M6 8h7.5M6 12h7.5M2.5 4h.01M2.5 8h.01M2.5 12h.01" />,
  look: (
    <>
      <circle cx="7" cy="7" r="4" />
      <path d="m10 10 3.5 3.5" />
    </>
  ),
  check: <path d="M3 8.5 6.5 12 13 4.5" />,
};

function Node({
  icon,
  tone,
  n,
  end,
  children,
}: {
  icon: keyof typeof ICON;
  tone: Tone;
  n?: number;
  end?: boolean;
  children: string;
}) {
  return (
    <div className={end ? "sr-node sr-end" : "sr-node"}>
      {n && (
        <span className="sr-n" aria-hidden="true">
          {n}
        </span>
      )}
      <span className="sr-tile" style={{ background: tone.c, color: tone.ink ? "#141414" : "#fff" }} aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          {ICON[icon]}
        </svg>
      </span>
      {children}
    </div>
  );
}

/** A wire with a port at each end and one travelling dot, in the colour of the node it leaves. */
function Wire({ dir, dot, delay }: { dir: "down" | "across"; dot: string; delay: number }) {
  return (
    <div className={`sr-wire sr-${dir}`} aria-hidden="true">
      <i className="sr-port sr-a" />
      <i className="sr-port sr-b" />
      <i className="sr-dot" style={{ "--dc": dot, "--d": `${delay}s` } as React.CSSProperties} />
    </div>
  );
}

export function ServiceRows() {
  return (
    <section className="sr" aria-label="Services and how to get started">
      <div className="sr-row">
        <h2 className="sr-label">Services</h2>
        <ul className="sr-groups">
          <li className="sr-box">
            <div className="sr-stack">
              <Node icon="flow" tone={{ c: "#6e56cf" }}>Process flow</Node>
              <Wire dir="down" dot="#6e56cf" delay={0} />
              <Node icon="build" tone={{ c: "#3e63dd" }}>Implementation</Node>
            </div>
          </li>
          <li className="sr-box">
            <div className="sr-fork">
              <Node icon="cloud" tone={{ c: "#0ea5e9" }}>Cloud</Node>
              <span className="sr-and">and</span>
              <Node icon="server" tone={{ c: "#0d9488" }}>On premise</Node>
              <div className="sr-merge" aria-hidden="true">
                <i className="sr-arm sr-l" />
                <i className="sr-arm sr-r" />
                <i className="sr-stem" />
                <i className="sr-port sr-pl" />
                <i className="sr-port sr-pr" />
                <i className="sr-port sr-pc" />
                <i className="sr-dot sr-ml" style={{ "--dc": "#0ea5e9", "--d": "0.4s" } as React.CSSProperties} />
                <i className="sr-dot sr-mr" style={{ "--dc": "#0d9488", "--d": "1.6s" } as React.CSSProperties} />
              </div>
              <div className="sr-last">
                <Node icon="parcel" tone={{ c: "#1f9d55" }}>Deployment</Node>
              </div>
            </div>
          </li>
          <li className="sr-box">
            <div className="sr-stack">
              <Node icon="spark" tone={ORANGE}>AI</Node>
              <Wire dir="down" dot="var(--orange)" delay={0.8} />
              <Node icon="turn" tone={{ c: "#2f6feb" }}>Transformation</Node>
            </div>
          </li>
        </ul>
        <span className="sr-spacer" aria-hidden="true" />
      </div>

      <div className="sr-row">
        <h2 className="sr-label">Get started</h2>
        <ol className="sr-steps">
          <li className="sr-step">
            <Node icon="list" tone={{ c: "#e54666" }} n={1}>Define your priorities</Node>
            <Wire dir="across" dot="#e54666" delay={0} />
          </li>
          <li className="sr-step">
            <Node icon="look" tone={{ c: "#0091ff" }} n={2}>Assess your environment</Node>
            <Wire dir="across" dot="#0091ff" delay={0.8} />
          </li>
          <li className="sr-step">
            <Node icon="check" tone={ORANGE} n={3} end>Transform</Node>
          </li>
        </ol>
        <span className="sr-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}

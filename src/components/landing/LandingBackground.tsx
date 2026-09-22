const GRID_IMAGE = [
  "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px)",
  "linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
].join(", ");

const GRID_MASK =
  "radial-gradient(ellipse 75% 60% at 50% 0%, black 20%, transparent 100%)";

export function LandingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-x-0 top-0 h-[560px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(79,70,229,0.16), transparent 65%)",
        }}
      />

      <div className="landing-drift-b absolute -top-32 right-[-6%] h-[420px] w-[420px] rounded-full bg-premium/20 blur-[110px]" />
      <div className="landing-drift-a absolute left-[-10%] top-[30%] h-[380px] w-[380px] rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute bottom-[12%] right-[-8%] h-[340px] w-[340px] rounded-full bg-info/10 blur-[100px]" />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRID_IMAGE,
          backgroundSize: "44px 44px",
          maskImage: GRID_MASK,
          WebkitMaskImage: GRID_MASK,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-56"
        style={{
          background:
            "linear-gradient(to top, var(--background) 15%, transparent)",
        }}
      />
    </div>
  );
}

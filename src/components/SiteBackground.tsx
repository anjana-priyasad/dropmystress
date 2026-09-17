/** Site-wide morning sky: soft sea-glass, lavender and peach washes drifting slowly over warm paper. */
export default function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#e3f1ee_0%,#eef1f6_38%,#f6f5f0_75%)]" />
      <div className="aurora absolute -top-[25%] -left-[10%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(125,211,192,0.45),transparent_62%)] blur-2xl" />
      <div className="aurora-slow absolute -top-[15%] right-[-18%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(186,190,250,0.5),transparent_62%)] blur-2xl" />
      <div className="aurora absolute bottom-[-35%] left-[20%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(253,214,186,0.35),transparent_60%)] blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(29,42,58,0.035)_1px,transparent_1px)] [background-size:22px_22px]" />
    </div>
  );
}

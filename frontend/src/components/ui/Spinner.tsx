function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  return <span className={`ui-spinner ui-spinner-${size}`} aria-hidden="true" />;
}

export default Spinner;

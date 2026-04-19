import aprendemosYaSvg from "../../../assets/aprendemosya.svg?raw";

export function AprendemosYaLogo() {
  return (
    <div
      className="login-logo login-logo-inline"
      aria-label="AprendemosYa"
      role="img"
      dangerouslySetInnerHTML={{ __html: aprendemosYaSvg }}
    />
  );
}

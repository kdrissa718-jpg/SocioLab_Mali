import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, CircleX, Search, ShieldCheck } from "lucide-react";
import { initialAttestations } from "../data/attestations";
import { useAppContext } from "../context/AppContext";

function readAttestations() {
  try {
    return JSON.parse(localStorage.getItem("sociolab_admin_attestations")) || initialAttestations;
  } catch {
    return initialAttestations;
  }
}

function AttestationVerification({ attestations }) {
  const { language, translations } = useAppContext();
  const content = translations[language].attestationVerification;
  const { id } = useParams();
  const [reference, setReference] = useState(() => decodeURIComponent(id || ""));
  const records = attestations || readAttestations();
  const normalizedReference = reference.trim().toLowerCase();
  const attestation = useMemo(
    () => records.find((item) => item.id.toLowerCase() === normalizedReference),
    [records, normalizedReference]
  );
  const hasSearch = Boolean(normalizedReference);
  const isValid = attestation?.status === "Validée";

  return (
    <section className="attestation-verification">
      <div className="verification-hero">
        <span className="verification-icon"><ShieldCheck size={26} aria-hidden="true" /></span>
        <div><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.description}</p></div>
      </div>
      <form className="verification-search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="certificate-reference">{content.referenceLabel}</label>
        <div><Search size={19} aria-hidden="true" /><input id="certificate-reference" value={reference} onChange={(event) => setReference(event.target.value)} placeholder={content.placeholder} autoComplete="off" /><button className="btn btn-primary" type="submit">{content.verify}</button></div>
      </form>
      {hasSearch && (attestation ? (
        <article className={`verification-result ${isValid ? "is-valid" : "is-invalid"}`}>
          {isValid ? <BadgeCheck size={34} aria-hidden="true" /> : <CircleX size={34} aria-hidden="true" />}
          <div><span>{isValid ? content.valid : content.invalid}</span><h2>{attestation.learner}</h2><p><strong>{content.course}</strong> {attestation.course}</p><p><strong>{content.reference}</strong> {attestation.id}</p><p><strong>{content.issued}</strong> {attestation.date}</p><p className="verification-status">{content.status} {isValid ? content.valid : content.invalid}</p></div>
        </article>
      ) : (
        <article className="verification-result is-not-found"><CircleX size={34} aria-hidden="true" /><div><span>{content.notFound}</span><p>{content.noMatch}</p></div></article>
      ))}
      {!id && <Link className="secondary-link" to="/">{content.backHome}</Link>}
    </section>
  );
}

export default AttestationVerification;

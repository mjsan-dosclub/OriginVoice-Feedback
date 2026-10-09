import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { OriginLogo } from "@/components/mark";

export function DesktopBlocker() {
  const [wide, setWide] = useState(false);
  const [url, setUrl] = useState("");
  const [src, setSrc] = useState("");

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => setWide(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!wide) return;
    const next = window.location.href;
    setUrl(next);
    let cancel = false;
    QRCode.toDataURL(next, {
      margin: 1,
      width: 512,
      color: { dark: "#121316", light: "#ffffff" },
    })
      .then((image) => {
        if (!cancel) setSrc(image);
      })
      .catch(() => {
        if (!cancel) setSrc("");
      });
    return () => {
      cancel = true;
    };
  }, [wide]);

  return (
    <aside className="hidden w-80 shrink-0 px-6 pt-16 pb-10 lg:block">
      <div className="w-full max-w-lg text-center">
        <OriginLogo className="mx-auto h-12 w-auto object-contain" />
        <p className="mt-5 text-xs font-medium tracking-widest text-subtle uppercase">VidyaConnect</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Try it here, or on a phone</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted">
          The booth is built for a phone. You can tap through it on the left, or scan this code to open the same
          screen on a mobile.
        </p>
        <div className="mx-auto mt-8 w-64 rounded-xl bg-surface p-4 ring-1 ring-border">
          <div className="rounded-md bg-fg p-3">
            {src ? (
              <img src={src} alt="QR code to open VidyaConnect on a phone" className="aspect-square w-full" />
            ) : (
              <div className="aspect-square w-full bg-elevated" />
            )}
          </div>
        </div>
        {url ? <p className="mt-4 text-sm break-all text-subtle">{url}</p> : null}
        <Link
          to="/admin"
          className="mt-8 inline-flex h-11 items-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          Booth desk
        </Link>
      </div>
    </aside>
  );
}

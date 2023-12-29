/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { type OgObject } from "open-graph-scraper/dist/lib/types";
import Link from "next/link";

export type OGPreviewProps = {
  ogData?: OgObject;
  url?: string;
};

const OGPreview: React.FC<OGPreviewProps> = (props) => {
  const data = props.ogData;

  if (!data) return null;

  const imgUrl = data.ogImage?.[0]?.url;

  const title = data.ogTitle || data.dcTitle || data.twitterTitle;
  const description =
    data.ogDescription || data.dcDescription || data.twitterDescription;

  return (
    <div>
      {/* <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre> */}
      <div className="mx-auto flex max-w-xl flex-col gap-3 rounded border p-4 md:flex-row">
        {imgUrl ? (
          <img src={imgUrl} className="h-32 w-auto object-cover" alt={title} />
        ) : null}

        <div className="flex flex-col gap-2">
          <Link href={props.url || ""}>
            <h3 className="font-bold">{title}</h3>
          </Link>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default OGPreview;

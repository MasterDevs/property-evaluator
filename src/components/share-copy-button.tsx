import { Share } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";

export type ShareCopyButtonProps = {
  className?: string;
  url: string;
};

const ShareCopyButton: React.FC<ShareCopyButtonProps> = (props) => {
  const [canShare, set_canShare] = React.useState<boolean>(false);

  React.useEffect(() => {
    set_canShare(
      navigator.share !== undefined &&
        navigator.canShare?.({ url: props.url }) === true
    );
  }, [set_canShare, props.url]);

  return (
    <Button
      variant={"link"}
      className={props.className}
      onClick={() => {
        if (canShare) {
          void navigator.share({ url: props.url });
        } else {
          copyToClipboard(props.url);
          alert("Url Copied to Clipboard");
        }
      }}
    >
      {"Share"}
      <Share className="ml-2 h-4 w-4" />
    </Button>
  );
};

function copyToClipboard(value: string) {
  if (navigator.clipboard) {
    void navigator.clipboard.writeText(value);
    return;
  }

  const el = document.createElement("textarea"); // Create a <textarea> element
  el.value = value; // Set its value to the string that you want copied
  el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
  el.style.position = "absolute";
  el.style.left = "-9999px"; // Move outside the screen to make it invisible
  document.body.appendChild(el); // Append the <textarea> element to the HTML document
  let selection = document.getSelection();
  const selected =
    selection && selection.rangeCount > 0 // Check if there is any content selected previously
      ? selection.getRangeAt(0) // Store selection if found
      : false; // Mark as false to know no selection existed before
  el.select(); // Select the <textarea> content
  document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el); // Remove the <textarea> element
  if (selected) {
    // If a selection existed before copying
    selection = document.getSelection();
    if (selection) {
      selection.removeAllRanges(); // Unselect everything on the HTML document
      selection.addRange(selected); // Restore the original selection
    }
  }
}

export default ShareCopyButton;

import * as React from "react";
import { cn } from "~/lib/utils";

type SpecialPrint = "percent" | "money" | "tax" | "atMost";

type ValueProps = {
  value: number;
  className?: string;
};
type DecimalDataProps = ValueProps & {
  decimalPlaces?: number;
  special?: SpecialPrint;
  hideSymbol?: boolean;
  noTrimZero?: boolean;
};

const taxFormat: Intl.NumberFormatOptions = {
  maximumFractionDigits: 3,
};

const atMostFormat: Intl.NumberFormatOptions = {
  maximumFractionDigits: 1,
};

const currencyFormat: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
  currencyDisplay: "symbol",
};

export function getDisplaySpecial(
  value: number,
  special: SpecialPrint,
  noTrimZero?: boolean
) {
  return getDisplayValue(value, undefined, special, false, noTrimZero);
}

export function getDisplayValue(
  value: number,
  decimalPlaces?: number,
  special?: SpecialPrint,
  hideSymbol?: boolean,
  noTrimZero?: boolean
) {
  if (value === null || value === undefined) return "";

  if (special) {
    if (special === "money") {
      let val = value.toLocaleString(undefined, currencyFormat);

      if (val.endsWith(".00") && !noTrimZero) {
        val = val.substr(0, val.length - 3);
      }

      val = hideSymbol ? val.substr(1) : val;

      if (
        val.length > 3 &&
        val[val.length - 3] === "." &&
        decimalPlaces === 0
      ) {
        val = val.substring(0, val.length - 3);
      }

      return val;
    } else if (special === "percent") {
      return `${(value * 100).toFixed(decimalPlaces || 0)}%`;
    } else if (special === "tax") {
      return `${(value * 100).toLocaleString(undefined, taxFormat)}%`;
    } else if (special === "atMost") {
      return value.toLocaleString(
        undefined,
        decimalPlaces ? { maximumFractionDigits: decimalPlaces } : atMostFormat
      );
    }
  }

  return decimalPlaces !== undefined && decimalPlaces !== null
    ? value.toLocaleString(undefined, {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces,
      })
    : value.toLocaleString();
}

const Decimal: React.FC<DecimalDataProps> = (props) => {
  const displayValue = getDisplayValue(
    props.value,
    props.decimalPlaces,
    props.special,
    props.hideSymbol,
    props.noTrimZero
  );

  return (
    <span title={props.value?.toString()} className={props.className}>
      {displayValue}
    </span>
  );
};

type MoneyValueProps = ValueProps & {
  hideSymbol?: boolean;
  noTrimZero?: boolean;
  decimalPlaces?: number;
};
export const Money: React.FC<MoneyValueProps> = (props) => (
  <Decimal
    value={props.value}
    special={"money"}
    decimalPlaces={props.decimalPlaces}
    hideSymbol={props.hideSymbol}
    noTrimZero={props.noTrimZero}
    className={props.className}
  />
);

export const Percent: React.FC<MoneyValueProps> = (props) => (
  <Decimal
    value={props.value}
    special={"percent"}
    decimalPlaces={props.decimalPlaces}
    hideSymbol={props.hideSymbol}
    noTrimZero={props.noTrimZero}
    className={props.className}
  />
);

type CellProps = {
  rowSpan?: number;
  colSpan?: number;
  cellAdditionalClassNames?: string;
};
export const MoneyCell: React.FC<
  MoneyValueProps &
    CellProps & { style?: React.CSSProperties; asCurrency?: boolean }
> = (props) => (
  <td
    className={cn("text-end", props.cellAdditionalClassNames)}
    style={props.style}
    rowSpan={props.rowSpan}
    colSpan={props.colSpan}
  >
    {props.asCurrency ? (
      <div className="flex justify-between">
        <span>$</span>
        <Decimal {...props} hideSymbol decimalPlaces={2} />
      </div>
    ) : (
      <Money {...props} />
    )}
  </td>
);
export const MoneyHeaderCell: React.FC<
  MoneyValueProps & CellProps & { style?: React.CSSProperties }
> = (props) => (
  <th
    className={cn("text-end", props.cellAdditionalClassNames)}
    style={props.style}
    rowSpan={props.rowSpan}
    colSpan={props.colSpan}
  >
    <Money {...props} />
  </th>
);

export const DecimalCell: React.FC<
  DecimalDataProps & CellProps & { style?: React.CSSProperties }
> = (props) => (
  <td
    className={cn("text-end", props.cellAdditionalClassNames)}
    style={props.style}
    rowSpan={props.rowSpan}
    colSpan={props.colSpan}
  >
    <Decimal {...props} />
  </td>
);

export const DecimalHeaderCell: React.FC<
  DecimalDataProps & CellProps & { style?: React.CSSProperties }
> = (props) => (
  <th
    className={cn("text-end", props.cellAdditionalClassNames)}
    style={props.style}
    rowSpan={props.rowSpan}
    colSpan={props.colSpan}
  >
    <Decimal {...props} />
  </th>
);
export const Tax: React.FC<ValueProps> = (props) => (
  <Decimal value={props.value} special={"tax"} className={props.className} />
);

export default Decimal;

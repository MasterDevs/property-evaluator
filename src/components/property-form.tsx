/* eslint-disable @typescript-eslint/no-misused-promises */
import * as React from "react";
import { useForm } from "react-hook-form";
import { ExternalLink, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Money,
  Percent,
  getDisplaySpecial,
  getDisplayValue,
} from "~/components/ui/decimal";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "~/components/ui/textarea";
import { useOgGraph } from "~/hooks/use-og-graph";
import OGPreview from "~/components/og-preview";
import { useRouter } from "next/router";

const SCHEMA = z.object({
  purchasePrice: z.coerce.number().default(500000),
  monthlyRent: z.coerce.number().default(1000),
  insurance: z.coerce.number().default(1200),
  loanRate: z.coerce.number().default(6.5),
  ltv: z.coerce.number().default(80),
  months: z.coerce.number().default(360),
  totalRehabCost: z.coerce.number().default(15000),
  postRehabValue: z.coerce.number().default(650000),
  taxesYearly: z.coerce.number().default(7500),
  closing: z.coerce.number().default(10000),
  vacancyRate: z.coerce.number().default(5),
  capitalExpendituresRate: z.coerce.number().default(5),
  repairRate: z.coerce.number().default(5),
  managementRate: z.coerce.number().default(0),
  url: z.coerce.string().default(""),
  notes: z.coerce.string().default(""),
});

type SCHEMA = z.infer<typeof SCHEMA>;

/**
 *
 * @param ir interest rate per month
 * @param np number of periods (months)
 * @param pv present value
 * @param fv future value
 * @param type  0: end of the period, e.g. end of month (default) | 1: beginning of period
 * @returns
 */
function PMT(ir: number, np: number, pv: number, fv: number, type: 0 | 1 = 0) {
  /*
   * ir   - interest rate per month
   * np   - number of periods (months)
   * pv   - present value
   * fv   - future value
   * type - when the payments are due:
   *        0: end of the period, e.g. end of month (default)
   *        1: beginning of period
   */
  let pmt: number;

  fv || (fv = 0);
  type || (type = 0);

  if (ir === 0) return -(pv + fv) / np;

  const pvif = Math.pow(1 + ir, np);
  pmt = (-ir * (pv * pvif + fv)) / (pvif - 1);

  if (type === 1) pmt /= 1 + ir;

  return pmt;
}

const PropertyForm: React.FC<SCHEMA> = (props) => {

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(SCHEMA),
    defaultValues: SCHEMA.parse(props),
  });

  const result = form.watch();

  const shareUrl = React.useMemo(() => `/?${Object.keys(result)
    .map((k) => `${k}=${result[k as keyof typeof result]}`)
    .join("&")}`, [result]);

  const ogData = useOgGraph(result.url);

  const monthlyTaxes = result.taxesYearly / 12;
  const monthlyInsurance = result.insurance / 12;
  const vacancy = (result.monthlyRent * result.vacancyRate) / 100;
  const management = (result.monthlyRent * result.managementRate) / 100;
  const capitalExpenditures =
    (result.monthlyRent * result.capitalExpendituresRate) / 100;
  const repairs = (result.monthlyRent * result.repairRate) / 100;

  const monthlyMortgagePayment = PMT(
    result.loanRate / 100 / 12,
    result.months,
    result.purchasePrice * (result.ltv / 100),
    0
  );
  const totalMonthlyCost =
    monthlyTaxes +
    monthlyInsurance +
    vacancy +
    management +
    capitalExpenditures +
    repairs -
    monthlyMortgagePayment;
  const netMonthlyCashFlow = result.monthlyRent - totalMonthlyCost;
  const onePercentRule = result.monthlyRent / result.purchasePrice;
  const capRate =
    ((result.monthlyRent -
      monthlyTaxes -
      monthlyInsurance -
      vacancy -
      management) *
      12) /
    result.purchasePrice;
  const cashFlow = result.monthlyRent * 0.5 + monthlyMortgagePayment;
  const totalClose =
    result.purchasePrice * (1 - result.ltv / 100) +
    //result.totalRehabCost +
    result.closing;
  const coCROI = (netMonthlyCashFlow * 12) / totalClose;

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => {
              console.log("Values", v);
            })}
            className="h-full w-full place-self-end rounded-lg border px-3 py-3 md:w-96 md:rounded-l-lg md:rounded-r-none"
          >
            <Accordion
              type="single"
              className="w-full"
              defaultValue="property-details"
            >
              <AccordionItem value="property-details">
                <AccordionTrigger>Property Details</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 border bg-gray-100 p-3">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Property Url"}</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Notes"}</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="bg-white" />
                          </FormControl>
                          <FormDescription>
                            {"Any notes you want to leave"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="purchasePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{"Purchase Price"}</FormLabel>
                            <FormControl>
                              <div className="input-group">
                                <span className="input-group-text">{"$"}</span>
                                <Input
                                  {...field}
                                  type="number"
                                  inputMode="decimal"
                                  className="bg-white"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              {"Purchase price of the property"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxesYearly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{"Taxes"}</FormLabel>
                            <FormControl>
                              <div className="input-group">
                                <span className="input-group-text">{"$"}</span>
                                <Input
                                  {...field}
                                  type="number"
                                  inputMode="decimal"
                                  className="bg-white"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              {"Yearly total taxes"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="insurance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Insurance"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <span className="input-group-text">{"$"}</span>
                              <Input
                                {...field}
                                type="number"
                                inputMode="decimal"
                                className="bg-white"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            {"Yearly homeowners insurance for the property"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="loan-info">
                <AccordionTrigger>Loan Details</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 border bg-gray-100 p-3">
                    <FormField
                      control={form.control}
                      name="loanRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Loan Rate"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <Input
                                {...field}
                                className="bg-white"
                                type="number"
                                inputMode="decimal"
                                step={0.5}
                              />
                              <span className="input-group-text">{"%"}</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ltv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Loan To Value"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <Input
                                {...field}
                                type="number"
                                className="bg-white"
                                inputMode="decimal"
                                step={0.5}
                              />
                              <span className="input-group-text">{"%"}</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {
                              "What percentage of the purchase price are you borrowing?"
                            }
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="income">
                <AccordionTrigger>{"Income"}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 border bg-gray-100 p-3">
                    <FormField
                      control={form.control}
                      name="monthlyRent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Rent"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <span className="input-group-text">{"$"}</span>
                              <Input
                                {...field}
                                type="number"
                                inputMode="decimal"
                                className="bg-white"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            {"Monthly Gross Rent"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="assumptions">
                <AccordionTrigger>{"Assumptions"}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 border bg-gray-100 p-3">
                    <FormField
                      control={form.control}
                      name="capitalExpendituresRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Capex Rate"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <Input
                                {...field}
                                type="number"
                                inputMode="decimal"
                                className="bg-white"
                              />
                              <span className="input-group-text">{"%"}</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {
                              "Rate of monthly revenue to put aside for capital expenditures"
                            }
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repairRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Repair Rate"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <Input
                                {...field}
                                type="number"
                                inputMode="decimal"
                                className="bg-white"
                              />
                              <span className="input-group-text">{"%"}</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {"Rate of monthly revenue to put aside for repairs"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vacancyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Vacancy Rate"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <Input
                                {...field}
                                type="number"
                                inputMode="decimal"
                                className="bg-white"
                              />
                              <span className="input-group-text">{"%"}</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {
                              "Rate of monthly revenue to put aside for vacancy between tenants"
                            }
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="managementRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Management Rate"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <Input
                                {...field}
                                type="number"
                                inputMode="decimal"
                                className="bg-white"
                              />
                              <span className="input-group-text">{"%"}</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {
                              "Rate of monthly revenue to put aside for management of the property. Set to 0 if self managing."
                            }
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="closing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Closing Costs"}</FormLabel>
                          <FormControl>
                            <div className="input-group">
                              <span className="input-group-text">{"$"}</span>
                              <Input
                                {...field}
                                type="number"
                                inputMode="decimal"
                                className="bg-white"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            {"Total amount necessary to close on the property"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* <AccordionItem value="rehab">
              <AccordionTrigger>{"Rehab Details"}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 bg-gray-100 p-3">
                  <FormField
                    control={form.control}
                    name="totalRehabCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Rehab Cost"}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            inputMode="decimal"
                            className="bg-white"
                          />
                        </FormControl>
                        <FormDescription>
                          {"Total amount to rehab the property"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postRehabValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Post Rehab Value"}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            inputMode="decimal"
                            className="bg-white"
                          />
                        </FormControl>
                        <FormDescription>
                          {"Value of property after the rehabilitation"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="expenses">
              <AccordionTrigger>{"Expenses"}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 bg-gray-100 p-3"></div>
              </AccordionContent>
            </AccordionItem> */}
            </Accordion>
          </form>
        </Form>
        <Card className="md:rounded-l-none md:border-l-0">
          <CardHeader className="mb-5 border-b">
            <CardTitle className="flex justify-between">
              <span>{"KPI's"}</span>
              <Link
                href={shareUrl}
                target="_blank"
                className="flex items-center gap-1"
              >
                {"Share"}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </CardTitle>
            <p className="italic text-muted-foreground">
              {"Long Term Rental KPI's"}
            </p>
            <OGPreview ogData={ogData.data} url={result.url} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 items-center">
              <KPI_Row
                format="money"
                value={netMonthlyCashFlow}
                level={
                  netMonthlyCashFlow > 400
                    ? "good"
                    : netMonthlyCashFlow > 100
                    ? "warning"
                    : "bad"
                }
                title="Monthly Cash Flow"
                description={
                  <div>
                    <p className="mb-3">{`Monthly revenue left after all expenses: `}</p>
                    <div className="mb-3 grid grid-cols-2 [&>*:nth-child(even)]:text-right">
                      <div className="mb-2 border-b font-bold">
                        {"Monthly Revenue"}
                      </div>
                      <Money
                        value={result.monthlyRent}
                        className="mb-2 border-b font-bold"
                      />

                      <div>{"Taxes"}</div>
                      <Money value={monthlyTaxes} decimalPlaces={0} />
                      <div>{"Insurance"}</div>
                      <Money value={monthlyInsurance} decimalPlaces={0} />
                      <div>{`Vacancy (${getDisplaySpecial(
                        result.vacancyRate / 100,
                        "percent"
                      )})`}</div>
                      <Money value={vacancy} decimalPlaces={0} />
                      {result.managementRate ? (
                        <>
                          <div>{`Management (${getDisplaySpecial(
                            result.managementRate / 100,
                            "percent"
                          )})`}</div>
                          <Money value={management} decimalPlaces={0} />
                        </>
                      ) : null}
                      <div title="Capital Expenditures">{`CapEx (${getDisplaySpecial(
                        result.capitalExpendituresRate / 100,
                        "percent"
                      )})`}</div>
                      <Money value={capitalExpenditures} decimalPlaces={0} />
                      <div>{`Repair (${getDisplaySpecial(
                        result.repairRate / 100,
                        "percent"
                      )})`}</div>
                      <Money value={repairs} decimalPlaces={0} />
                      <div>{"Mortgage Payment"}</div>
                      <Money
                        value={monthlyMortgagePayment * -1}
                        decimalPlaces={0}
                      />
                    </div>
                    <GWB good={"> $400"} warn="> $100" bad="< 0%" />
                  </div>
                }
              />

              <KPI_Row
                format="percent"
                value={onePercentRule}
                level={
                  onePercentRule >= 0.01
                    ? "good"
                    : onePercentRule > 0.008
                    ? "warning"
                    : "bad"
                }
                title="1% Percent Rule"
                description={
                  <div>
                    <p className="mb-3">{`The 1% rule says that monthly rent should equal to 1% of the purchase price.`}</p>
                    <GWB good={"> 1%"} warn="> 0.8%" bad="< 0%" />
                  </div>
                }
              />
              <KPI_Row
                format="percent"
                value={capRate}
                level={
                  capRate >= 0.08 ? "good" : capRate > 0.05 ? "warning" : "bad"
                }
                title="Cap Rate"
                description={
                  <div>
                    <div className="my-3 flex flex-col divide-y-2 text-center">
                      <var>{"Net Operating Income"}</var>
                      <var>{"Market Value"}</var>
                    </div>
                    <GWB good={"> 8%"} warn="5-8%" bad={"< 5%"} />
                  </div>
                }
              />
              <KPI_Row
                format="money"
                value={cashFlow}
                level={cashFlow > 0 ? "good" : cashFlow < 0 ? "bad" : "warning"}
                title="50% Rule for Cash Flow"
                description={
                  <div>
                    <p>{`The 50% Rule says that you should estimate your operating expenses to be 50% of gross income (sometimes referred to as an expense ratio of 50%).`}</p>
                    <div className="flex items-center justify-center">
                      <div className="my-3 flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <var className={"border-b-2 px-2"}>
                            {"Monthly Rent"}
                          </var>
                          <var>{"2"}</var>
                        </div>
                        <Minus className="h-4 w-4" />
                        <var>{"Mortgage Payment"}</var>
                      </div>
                    </div>
                    <GWB good={"> $0"} warn="$0" bad={"< $0"} />
                  </div>
                }
              />
              <KPI_Row
                format="percent"
                value={coCROI}
                level={coCROI >= 0.08 ? "good" : coCROI > 0 ? "warning" : "bad"}
                description={
                  <div>
                    <p>{`Cash-on-Cash return or (CoCROI) calculate the cash income earned on the cash invested in a property. It measures the annual return the investor made on the property in relation to the amount of mortgage paid during the same year.`}</p>
                    <p className="mt-2">{`Can we pull in more then the return we'd get from just putting our money in the S&P or some IndexFund`}</p>
                    <div className="my-3 flex flex-col divide-y-2 text-center">
                      <div className="flex justify-between">
                        <var>{"Annual Income"}</var>
                        <var>
                          {getDisplayValue(netMonthlyCashFlow * 12, 0, "money")}
                        </var>
                      </div>
                      <div className="flex justify-between">
                        <var>{"Annual Invested"}</var>
                        <var>{getDisplayValue(totalClose, 0, "money")}</var>
                      </div>
                    </div>

                    <GWB good={"> 0.08"} warn="> 0" bad="< 0" />
                  </div>
                }
                title="CoCROI"
              />
              <KPI_Row
                format="money"
                value={totalClose}
                title="Total Cash to Close"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const GWB: React.FC<{
  good: React.ReactNode;
  warn: React.ReactNode;
  bad: React.ReactNode;
}> = (props) => {
  return (
    <div
      className="grid items-center gap-1 rounded border p-3"
      style={{ gridTemplateColumns: "auto 1fr" }}
    >
      <div className="h-4 w-20 rounded bg-green-200"></div>
      <div className="text-right">{props.good}</div>
      <div className="h-4 w-20 rounded bg-yellow-200"></div>
      <div className="text-right">{props.warn}</div>
      <div className="h-4 w-20 rounded bg-red-200"></div>
      <div className="text-right">{props.bad}</div>
    </div>
  );
};

const KPI_Row: React.FC<{
  title: string;
  description?: React.ReactNode;
  value: number;
  format: "money" | "percent";
  level?: "good" | "bad" | "warning";
}> = (props) => {
  const cellCN = cn("rounded-md px-2", {
    "bg-green-200 text-green-900 border-green-300 hover:bg-green-300 hover:border-green-400 hover:text-green-900": props.level === "good",
    "bg-yellow-200 text-yellow-900 border-yellow-300 hover:bg-yellow-300 hover:border-yellow-400 hover:text-yellow-900": props.level === "warning",
    "bg-red-200 text-red-900 border-red-300 hover:bg-red-300 hover:border-red-400 hover:text-red-900": props.level === "bad",
  });
  return (
    <>
      <div>{props.title}</div>
      <div className={cn("text-right")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cellCN}>
              {props.format === "money" ? (
                <Money value={props.value} />
              ) : (
                <Percent value={props.value} decimalPlaces={2} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">{props.description}</PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default PropertyForm;

/* eslint-disable @typescript-eslint/no-misused-promises */
import * as React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Money, Percent } from "~/components/ui/decimal";
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

const defaultValues = {
  purchasePrice: 500000,
  monthlyRent: 1000,
  insurance: 1200,
  loanRate: 6.5,
  ltv: 80,
  months: 360,
  totalRehabCost: 15000,
  postRehabValue: 650000,
  taxesYearly: 7500,
  closing: 10000,
};

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

const PropertyForm: React.FC = () => {
  const form = useForm({
    defaultValues: defaultValues,
  });

  const result = form.watch();

  const monthlyTaxes = result.taxesYearly / 12;
  const monthlyInsurance = result.insurance / 12;
  const vacancy = result.monthlyRent * 0.05;
  const capex = result.monthlyRent * 0.05;
  const repairs = result.monthlyRent * 0.05;

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
    capex +
    repairs -
    monthlyMortgagePayment;
  const netMonthlyCashFlow = result.monthlyRent - totalMonthlyCost;
  const onePercentRule = result.monthlyRent / result.purchasePrice;
  const capRate =
    ((result.monthlyRent - monthlyTaxes - monthlyInsurance - vacancy) * 12) /
    result.purchasePrice;
  const cashFlow = result.monthlyRent * 0.5 + monthlyMortgagePayment;
  const totalClose =
    result.purchasePrice * (1 - result.ltv / 100) +
    result.totalRehabCost +
    result.closing;
  const coCROI = (netMonthlyCashFlow * 12) / totalClose;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => {
            console.log("Values", v);
          })}
        >
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="property-details"
          >
            <AccordionItem value="property-details">
              <AccordionTrigger>Property Details</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 border bg-gray-50 p-3">
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
                          {"Yearly insurance for the property"}
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
                <div className="flex flex-col gap-2 border bg-gray-50 p-3">
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
                <div className="flex flex-col gap-2 border bg-gray-50 p-3">
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
            {/* <AccordionItem value="rehab">
              <AccordionTrigger>{"Rehab Details"}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 bg-gray-50 p-3">
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
                <div className="flex flex-col gap-2 bg-gray-50 p-3"></div>
              </AccordionContent>
            </AccordionItem> */}
          </Accordion>
        </form>
      </Form>
      <div>
        <Card>
          <CardHeader className="mb-5 border-b">
            <CardTitle>{"KPI's"}</CardTitle>
            <p className="italic text-muted-foreground">
              {"Long Term Rental KPI's"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
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
                title="One Percent Rule"
              />
              <KPI_Row
                format="percent"
                value={capRate}
                level={
                  capRate >= 0.08 ? "good" : capRate > 0.05 ? "warning" : "bad"
                }
                title="Cap Rate"
              />
              <KPI_Row
                format="money"
                value={cashFlow}
                level={cashFlow > 0 ? "good" : cashFlow < 0 ? "bad" : "warning"}
                title="50% Rule for Cash Flow"
              />
              <KPI_Row
                format="percent"
                value={coCROI}
                level={coCROI >= 0.08 ? "good" : coCROI > 0 ? "warning" : "bad"}
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

export const KPI_Row: React.FC<{
  title: string;
  description?: string;
  value: number;
  format: "money" | "percent";
  level?: "good" | "bad" | "warning";
}> = (props) => {
  const cellCN = cn("rounded-md px-2", {
    "bg-green-200 text-green-900": props.level === "good",
    "bg-yellow-200 text-yellow-900": props.level === "warning",
    "bg-red-200 text-red-900": props.level === "bad",
  });
  return (
    <>
      <div>{props.title}</div>
      <div className={cn("text-right")}>
        {props.format === "money" ? (
          <Money value={props.value} className={cellCN} />
        ) : (
          <Percent value={props.value} className={cellCN} decimalPlaces={2} />
        )}
      </div>
    </>
  );
};

export default PropertyForm;

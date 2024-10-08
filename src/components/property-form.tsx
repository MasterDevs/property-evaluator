/* eslint-disable @typescript-eslint/no-misused-promises */
import * as React from "react";
import { useForm } from "react-hook-form";
import { Loader2Icon, Minus } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "~/components/ui/textarea";
import { useOgGraph } from "~/hooks/use-og-graph";
import OGPreview from "~/components/og-preview";
import ShareCopyButton from "~/components/share-copy-button";
import { PropertySchema } from "~/lib/schema";
import { api } from "~/utils/api";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

/**
 *
 * @param interestRatePerMonth interest rate per month
 * @param numberOfPeriods number of periods (months)
 * @param presentValue present value
 * @param futureValue future value
 * @param type  0: end of the period, e.g. end of month (default) | 1: beginning of period
 * @returns
 */
function PMT(
  interestRatePerMonth: number,
  numberOfPeriods: number,
  presentValue: number,
  futureValue: number,
  type: 0 | 1 = 0
) {
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

  futureValue || (futureValue = 0);
  type || (type = 0);

  if (interestRatePerMonth === 0)
    return -(presentValue + futureValue) / numberOfPeriods;

  const p = Math.pow(1 + interestRatePerMonth, numberOfPeriods);
  pmt = (-interestRatePerMonth * (presentValue * p + futureValue)) / (p - 1);

  if (type === 1) pmt /= 1 + interestRatePerMonth;

  return pmt;
}

const PropertyForm: React.FC<PropertySchema> = (props) => {
  const form = useForm<PropertySchema>({
    resolver: zodResolver(PropertySchema),
    defaultValues: PropertySchema.parse(props),
  });

  const update = api.main.updateProperty.useMutation();

  const values = form.watch();
  const result = React.useMemo(() => {
    const r = PropertySchema.safeParse(values);
    if (r.success) {
      return r.data;
    }
    return values;
  }, [values]);

  const shareUrl = React.useMemo(() => `/?id=${result.id}`, [result]);

  const ogData = useOgGraph(result.url ?? "");

  const {
    capitalExpenditures,
    capRate,
    cashFlow,
    coCROI,
    management,
    monthlyInsurance,
    monthlyMortgagePayment,
    monthlyRev,
    monthlyTaxes,
    netMonthlyCashFlow,
    onePercentRule,
    repairs,
    totalClose,
    vacancy,
  } = generateDetails(result);

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => {
              update.mutate({
                ...v,
                oginfo: ogData.data ?? null,
              });
            })}
            className="h-full w-full place-self-end rounded-lg border px-3 py-3 md:w-96 md:rounded-l-lg md:rounded-r-none"
          >
            <div className="flex justify-between">
              <Button type="submit" disabled={update.isLoading}>
                {update.isLoading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mode"
                  checked={values.mode === "ltr"}
                  onCheckedChange={(v) =>
                    form.setValue("mode", v ? "ltr" : "str")
                  }
                />
                <Label htmlFor="mode">
                  {values.mode === "ltr" ? "LTR" : "STR"}
                </Label>
              </div>
            </div>
            <Accordion
              type="single"
              collapsible
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
                    {values.mode === "ltr" ? (
                      <>
                        <FormField
                          control={form.control}
                          name="monthlyRent"
                          key={"monthlyRent"}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{"Rent"}</FormLabel>
                              <FormControl>
                                <div className="input-group">
                                  <span className="input-group-text">
                                    {"$"}
                                  </span>
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
                      </>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="occupancyRate"
                          key={"occupancyRate"}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{"Occupancy Rate"}</FormLabel>
                              <FormControl>
                                <div className="input-group">
                                  <Input
                                    {...field}
                                    type="number"
                                    className="bg-white"
                                    inputMode="decimal"
                                    step={0.5}
                                  />
                                  <span className="input-group-text">
                                    {"%"}
                                  </span>
                                </div>
                              </FormControl>
                              <FormDescription>
                                {
                                  "What percentage of nights are rented in a given month?"
                                }
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="averageNightlyRent"
                          key={"averageNightlyRent"}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{"Average Nightly Rent"}</FormLabel>
                              <FormControl>
                                <div className="input-group">
                                  <span className="input-group-text">
                                    {"$"}
                                  </span>
                                  <Input
                                    {...field}
                                    type="number"
                                    inputMode="decimal"
                                    className="bg-white"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                {"Average Nightly Rent"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
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
            <CardTitle className="flex items-center justify-between">
              <span>{"KPI's"}</span>
              <ShareCopyButton
                url={shareUrl}
                className="flex items-center text-lg"
              />
            </CardTitle>
            <p className="italic text-muted-foreground">
              {"Long Term Rental KPI's"}
            </p>
            <OGPreview ogData={ogData.data} url={result.url} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 items-center gap-3">
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
                    <GWB good={"$400"} warn="$100" bad="$0" />
                    <p className="mb-3">{`Monthly revenue left after all expenses: `}</p>
                    <div className="mb-3 grid grid-cols-2 [&>*:nth-child(even)]:text-right">
                      <div className="mb-2 border-b font-bold">
                        {"Monthly Revenue"}
                      </div>
                      <Money
                        value={monthlyRev}
                        className="mb-2 border-b font-bold"
                      />

                      <div>{"Taxes"}</div>
                      <Money value={monthlyTaxes} decimalPlaces={0} />
                      <div>{"Insurance"}</div>
                      <Money value={monthlyInsurance} decimalPlaces={0} />
                      {result.mode === "ltr" ? (
                        <>
                          <div>{`Vacancy (${getDisplaySpecial(
                            result.vacancyRate / 100,
                            "percent"
                          )})`}</div>
                          <Money value={vacancy} decimalPlaces={0} />
                        </>
                      ) : null}
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
                    <GWB good={"1%"} warn="" bad="0.8%" />
                    <p className="mb-3">{`The 1% rule says that monthly rent should equal to 1% of the purchase price.`}</p>
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
                    <GWB good={"8%"} warn="" bad={"5%"} />
                    <div className="my-3 flex flex-col divide-y-2 text-center">
                      <var>{"Net Operating Income"}</var>
                      <var>{"Market Value"}</var>
                    </div>
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
                    <GWB good={"$0"} warn="" bad={"$0"} />
                    <p>{`The 50% Rule says that you should estimate your operating expenses to be 50% of gross income (sometimes referred to as an expense ratio of 50%).`}</p>
                    <div className="flex items-center justify-center">
                      <div className="my-3 flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <var className={"whitespace-nowrap border-b-2 px-2"}>
                            {"Monthly Rent"}
                          </var>
                          <var>{"2"}</var>
                        </div>
                        <Minus className="h-4 w-4" />
                        <var className="whitespace-nowrap">
                          {"Mortgage Payment"}
                        </var>
                      </div>
                    </div>
                  </div>
                }
              />
              <KPI_Row
                format="percent"
                value={coCROI}
                level={
                  coCROI >= 0.08 ? "good" : coCROI > 0.05 ? "warning" : "bad"
                }
                description={
                  <div>
                    <GWB good={"8%"} warn="" bad="5%" />
                    <p>{`Cash-on-Cash return or (CoCROI) calculate the cash income earned on the cash invested in a property. It measures the annual return the investor made on the property in relation to the amount of mortgage paid during the same year.`}</p>
                    <p className="mt-2">{`Can we pull in more then the return we'd get from just putting our money in the S&P or some IndexFund.`}</p>
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
                  </div>
                }
                title="CoCROI"
              />
              <KPI_Row
                format="money"
                value={totalClose}
                title="Total Cash to Close"
                description={
                  <div>
                    <p>{`Total cash to close is the amount of money needed to purchase the property (based on the LTV amount) as well as the closing costs.`}</p>
                    <div className="my-3 grid grid-cols-2 [&>*:nth-child(even)]:text-right">
                      <div className="">{"Down Payment"}</div>
                      <Money
                        value={result.purchasePrice * (1 - result.ltv / 100)}
                        className=""
                      />
                      <div className="">{"Closing Costs"}</div>
                      <Money value={result.closing} className="" />
                    </div>
                  </div>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function generateDetails(result: PropertySchema) {
  const isLtr = result.mode === "ltr";
  const monthlyRev = isLtr
    ? result.monthlyRent
    : (result.averageNightlyRent * 365 * (result.occupancyRate / 100)) / 12;

  const monthlyTaxes = result.taxesYearly / 12;
  const monthlyInsurance = result.insurance / 12;
  const vacancy = isLtr ? (monthlyRev * result.vacancyRate) / 100 : 0;
  const management = (monthlyRev * result.managementRate) / 100;
  const capitalExpenditures =
    (monthlyRev * result.capitalExpendituresRate) / 100;
  const repairs = (monthlyRev * result.repairRate) / 100;

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
  const netMonthlyCashFlow = monthlyRev - totalMonthlyCost;
  const onePercentRule = monthlyRev / result.purchasePrice;
  const capRate =
    ((monthlyRev - monthlyTaxes - monthlyInsurance - vacancy - management) *
      12) /
    result.purchasePrice;
  const cashFlow = monthlyRev * 0.5 + monthlyMortgagePayment;

  const totalClose =
    result.purchasePrice * (1 - result.ltv / 100) +
    //result.totalRehabCost +
    result.closing;
  const coCROI = (netMonthlyCashFlow * 12) / totalClose;

  return {
    capitalExpenditures,
    capRate,
    cashFlow,
    coCROI,
    management,
    monthlyInsurance,
    monthlyMortgagePayment,
    monthlyRev,
    monthlyTaxes,
    netMonthlyCashFlow,
    onePercentRule,
    repairs,
    totalClose,
    totalMonthlyCost,
    vacancy,
  };
}

const GWB: React.FC<{
  good: React.ReactNode;
  warn: React.ReactNode;
  bad: React.ReactNode;
}> = (props) => {
  return (
    <div>
      {/* <div className="mb-3 grid grid-cols-3 overflow-hidden rounded">
        <div className="bg-red-200 pr-2 text-right text-muted-foreground">
          {props.bad}
        </div>
        <div className="bg-yellow-200 text-center text-muted-foreground">
          {props.warn}
        </div>
        <div className="bg-green-200 pl-2 text-left text-muted-foreground">
          {props.good}
        </div>
      </div> */}
      <div className="mb-3 grid grid-cols-3 overflow-hidden rounded">
        <span className="text-right text-sm text-muted-foreground">
          {props.bad}
        </span>
        <span className="text-center text-sm text-muted-foreground">
          {props.warn}
        </span>
        <span className="text-left text-sm text-muted-foreground">
          {props.good}
        </span>
        <div className="h-2 rounded-l bg-red-200"></div>
        <div className="h-2 bg-yellow-200"></div>
        <div className="h-2 rounded-r bg-green-200"></div>
      </div>
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
    "bg-green-200 text-green-900 border-green-300 hover:bg-green-300 hover:border-green-400 hover:text-green-900":
      props.level === "good",
    "bg-yellow-200 text-yellow-900 border-yellow-300 hover:bg-yellow-300 hover:border-yellow-400 hover:text-yellow-900":
      props.level === "warning",
    "bg-red-200 text-red-900 border-red-300 hover:bg-red-300 hover:border-red-400 hover:text-red-900":
      props.level === "bad",
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

import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/app/generated/prisma/enums";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentVerificationActions } from "@/components/admin/payment-actions";
import { formatDistanceToNow } from "date-fns";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      user: true,
      appointment: {
        include: { doctor: { include: { user: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = payments.filter(
    (p) => p.status === PaymentStatus.SUBMITTED || (p.status === PaymentStatus.PENDING && !!p.utrNumber)
  );
  const all = payments;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Payment Verification</h1>
      <p className="text-muted-foreground mb-8">Verify patient payments and manage transactions</p>

      {/* Pending verification queue */}
      {pending.length > 0 && (
        <div className="mb-10">
          <CardTitle className="mb-4 text-amber-700">⏳ Awaiting Verification ({pending.length})</CardTitle>
          <div className="space-y-4">
            {pending.map((payment) => (
              <Card key={payment.id} className="p-5 border-amber-200 bg-amber-50/50">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{payment.user.name}</h3>
                      <Badge variant="SUBMITTED">Submitted</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Dr. {payment.appointment.doctor.user.name} &middot; {formatDate(payment.appointment.date)}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {formatCurrency(Number(payment.amount))}
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">UTR / Ref:</span>{" "}
                        <span className="font-mono bg-amber-100 px-2 py-0.5 rounded text-amber-900">{payment.utrNumber}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDistanceToNow(payment.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                    {payment.screenshotUrl && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Payment Screenshot:</p>
                        <a href={payment.screenshotUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={payment.screenshotUrl}
                            alt="Payment screenshot"
                            className="w-40 h-40 object-cover rounded-lg border border-amber-200 hover:opacity-80 transition-opacity"
                          />
                          <p className="text-xs text-primary mt-1">Click to view full size →</p>
                        </a>
                      </div>
                    )}
                  </div>
                  <PaymentVerificationActions paymentId={payment.id} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <Card className="mb-10 p-6 bg-green-50/50 border-green-200">
          <p className="text-center text-green-700 font-medium">✓ No pending verifications</p>
        </Card>
      )}

      {/* All payments */}
      <CardTitle className="mb-4">All Payments</CardTitle>
      {all.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-muted-foreground">No payments found</p>
        </Card>
      ) : (
          <div className="space-y-3">
          {all.map((payment) => (
            <Card key={payment.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">
                    {payment.user.name} → Dr. {payment.appointment.doctor.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(payment.amount))}
                    {payment.utrNumber && ` · UTR: ${payment.utrNumber}`}
                    {" · "}{formatDate(payment.createdAt)}
                  </p>
                  {payment.rejectionReason && (
                    <p className="text-xs text-destructive mt-1">Reason: {payment.rejectionReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={payment.status}>{payment.status.replace(/_/g, " ")}</Badge>
                  {(payment.status === PaymentStatus.SUBMITTED || (payment.status === PaymentStatus.PENDING && payment.utrNumber)) && (
                    <PaymentVerificationActions paymentId={payment.id} />
                  )}
                  {payment.screenshotUrl && (
                    <a href={payment.screenshotUrl} target="_blank" rel="noopener noreferrer" className="ml-2">
                      <img src={payment.screenshotUrl} alt="screenshot" className="w-16 h-12 object-cover rounded-md border" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

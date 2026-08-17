import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: "M" | "F";
}

interface OTPVerificationProps {
  mobileNumber: string;
  rationNumber: string;
  onVerify: (selectedMembers: string[]) => void;
  expectedOTP?: string;
  onResendOTP?: () => void;
}

const familyMembersData: Record<string, FamilyMember[]> = {
  "123456789012": [
    { id: "1", name: "Ramesh Kumar", relation: "Head", age: 45, gender: "M" },
    { id: "2", name: "Priya Ramesh", relation: "Spouse", age: 40, gender: "F" },
  ],
  "234567890123": [
    { id: "1", name: "Suresh Patel", relation: "Head", age: 42, gender: "M" },
    { id: "2", name: "Lakshmi Suresh", relation: "Spouse", age: 38, gender: "F" },
    { id: "3", name: "Arun Suresh", relation: "Son", age: 15, gender: "M" },
  ],
  "345678901234": [
    { id: "1", name: "Vijay Sharma", relation: "Head", age: 48, gender: "M" },
    { id: "2", name: "Meena Vijay", relation: "Spouse", age: 44, gender: "F" },
    { id: "3", name: "Kavya Vijay", relation: "Daughter", age: 18, gender: "F" },
    { id: "4", name: "Arjun Vijay", relation: "Son", age: 14, gender: "M" },
  ],
  "456789012345": [
    { id: "1", name: "Murugan Raj", relation: "Head", age: 50, gender: "M" },
    { id: "2", name: "Saranya Murugan", relation: "Spouse", age: 46, gender: "F" },
    { id: "3", name: "Deepak Murugan", relation: "Son", age: 20, gender: "M" },
    { id: "4", name: "Priya Murugan", relation: "Daughter", age: 16, gender: "F" },
    { id: "5", name: "Kamala Devi", relation: "Mother", age: 72, gender: "F" },
  ],
};

const OTPVerification = ({ mobileNumber, rationNumber, onVerify, expectedOTP, onResendOTP }: OTPVerificationProps) => {
  const { t } = useLanguage();
  const familyMembers = familyMembersData[rationNumber] || familyMembersData["123456789012"];
  const [otp, setOtp] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    setOtpError("");

    // Validate OTP
    if (expectedOTP && otp !== expectedOTP) {
      setOtpError(t("otp.invalidOTP"));
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      onVerify([selectedMember]);
      setIsVerifying(false);
    }, 1500);
  };

  const selectMember = (memberId: string) => {
    setSelectedMember(memberId);
  };

  const resendOTP = () => {
    setTimeLeft(30);
    setOtpError("");
    onResendOTP?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-primary/40 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("otp.title")}</h1>
          <p className="text-muted-foreground">{t("otp.description")}</p>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {t("otp.heading")}
              </CardTitle>
              <CardDescription>
                {t("otp.sentTo")} {mobileNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, index) => (
                  <Input
                    key={index}
                    type="text"
                    maxLength={1}
                    className={`w-12 h-12 text-center text-xl font-semibold ${otpError ? "border-destructive" : ""}`}
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const newOtp = otp.split("");
                      newOtp[index] = e.target.value;
                      setOtp(newOtp.join(""));
                      setOtpError("");

                      if (e.target.value && index < 5) {
                        const nextInput = document.querySelectorAll('input[type="text"]')[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-center justify-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {otpError}
                </div>
              )}

              {expectedOTP && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("otp.demoHint")}</p>
                  <p className="font-mono text-lg tracking-widest font-semibold text-primary">{expectedOTP}</p>
                </div>
              )}

              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("otp.resendIn")} {timeLeft}s
                  </p>
                ) : (
                  <Button variant="outline" size="sm" onClick={resendOTP}>
                    {t("otp.resend")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t("otp.familyMembers")}
              </CardTitle>
              <CardDescription>
                {t("otp.selectMember")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMember === member.id
                        ? "bg-success/10 border-success"
                        : "bg-muted/50 border-border hover:bg-muted"
                    }`}
                    onClick={() => selectMember(member.id)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={member.gender === "M" ? "bg-blue-100" : "bg-pink-100"}>
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        {selectedMember === member.id && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {member.relation}
                        </Badge>
                        <span>{member.age} {t("otp.years")}</span>
                        <Badge variant={member.gender === "M" ? "default" : "secondary"} className="text-xs">
                          {member.gender === "M" ? t("otp.male") : t("otp.female")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  {selectedMember ? `1 ${t("otp.memberSelected")}` : t("otp.pleaseSelect")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying || !selectedMember}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12"
          >
            {isVerifying ? t("otp.verifying") : t("otp.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;

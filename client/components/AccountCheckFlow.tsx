import React, { useState } from "react";

interface AccountCheckFlowProps {
  title?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  startButton?: string;
  warningText?: string;
  warningItem1?: string;
  warningItem2?: string;
  warningItem3?: string;
  continueButton?: string;
  nameLabel?: string;
  idLabel?: string;
  emailLabel?: string;
  submitButton?: string;
  successMessage?: string;
  buttonColor?: string;
  warningColor?: string;
  submitColor?: string;
}

export default function AccountCheckFlow({
  title = "账户异常处理中心",
  phoneLabel = "手机号",
  phonePlaceholder = "请输入手机号",
  startButton = "开始查询",
  warningText = "系统检测到该账号存在异常行为",
  warningItem1 = "多次登录失败",
  warningItem2 = "密码输入错误超过安全阈值",
  warningItem3 = "存在可疑交易记录",
  continueButton = "继续解除异常",
  nameLabel = "姓名",
  idLabel = "身份证号",
  emailLabel = "邮箱",
  submitButton = "提交",
  successMessage = "提交成功",
  buttonColor = "bg-blue-600",
  warningColor = "text-red-600",
  submitColor = "bg-green-600"
}: AccountCheckFlowProps) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({ name: "", id: "", email: "" });

  const next = () => setStep(step + 1);

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="mb-4">步骤 {step}/3</div>

      {step === 1 && (
        <div>
          <label className="block mb-2 font-medium">{phoneLabel}</label>
          <input
            className="w-full border px-3 py-2 mb-4"
            placeholder={phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={next} className={`${buttonColor} text-white px-4 py-2 rounded`}>
            {startButton}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className={`${warningColor} mb-2`}>{warningText}</p>
          <ul className="text-sm list-disc ml-5 mb-4">
            <li>{warningItem1}</li>
            <li>{warningItem2}</li>
            <li>{warningItem3}</li>
          </ul>
          <button onClick={next} className={`${buttonColor} text-white px-4 py-2 rounded`}>
            {continueButton}
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block mb-2 font-medium">{nameLabel}</label>
          <input
            className="w-full border px-3 py-2 mb-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="block mb-2 font-medium">{idLabel}</label>
          <input
            className="w-full border px-3 py-2 mb-2"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />
          <label className="block mb-2 font-medium">{emailLabel}</label>
          <input
            className="w-full border px-3 py-2 mb-4"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button onClick={() => alert(successMessage)} className={`${submitColor} text-white px-4 py-2 rounded`}>
            {submitButton}
          </button>
        </div>
      )}
    </div>
  );
}

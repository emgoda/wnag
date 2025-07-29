import React, { useState } from "react";

export default function AccountCheckFlow() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({ name: "", id: "", email: "" });

  const next = () => setStep(step + 1);

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">账户异常处理中心</h2>
      <div className="mb-4">步骤 {step}/3</div>

      {step === 1 && (
        <div>
          <label className="block mb-2 font-medium">手机号</label>
          <input
            className="w-full border px-3 py-2 mb-4"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded">
            开始查询
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-red-600 mb-2">系统检测到该账号存在异常行为</p>
          <ul className="text-sm list-disc ml-5 mb-4">
            <li>多次登录失败</li>
            <li>密码输入错误超过安全阈值</li>
            <li>存在可疑交易记录</li>
          </ul>
          <button onClick={next} className="bg-blue-600 text-white px-4 py-2 rounded">
            继续解除异常
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block mb-2 font-medium">姓名</label>
          <input
            className="w-full border px-3 py-2 mb-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label className="block mb-2 font-medium">身份证号</label>
          <input
            className="w-full border px-3 py-2 mb-2"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />
          <label className="block mb-2 font-medium">邮箱</label>
          <input
            className="w-full border px-3 py-2 mb-4"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button onClick={() => alert("提交成功")} className="bg-green-600 text-white px-4 py-2 rounded">
            提交
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storesAPI } from "@/lib/api";
import toast from "react-hot-toast";

const initialForm = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  timezone: "Asia/Kolkata",
  manager: "",
};

export default function StoreCreatePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.code) errs.code = "Code is required";
    if (!form.city) errs.city = "City is required";
    if (!form.state) errs.state = "State is required";
    if (!form.address) errs.address = "Address is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await storesAPI.createStore(form);
      toast.success("Store created!");
      router.push("/business-admin/stores");
    } catch (err: any) {
      toast.error("Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Store</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block font-medium">Code</label>
          <input name="code" value={form.code} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
        </div>
        <div>
          <label className="block font-medium">Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
        </div>
        <div>
          <label className="block font-medium">City</label>
          <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
        </div>
        <div>
          <label className="block font-medium">State</label>
          <input name="state" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
        </div>
        <div>
          <label className="block font-medium">Timezone</label>
          <input name="timezone" value={form.timezone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium">Manager (User ID)</label>
          <input name="manager" value={form.manager} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Saving..." : "Create Store"}
        </button>
      </form>
    </div>
  );
} 
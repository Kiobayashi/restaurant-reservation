import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Schemat walidacji
const schema = yup.object().shape({
  name: yup.string().required("Podaj imię"),
  email: yup.string().email("Niepoprawny email").required("Podaj email"),
  guests: yup
    .number()
    .typeError("Podaj liczbę gości")
    .integer()
    .min(1, "Min. 1 gość")
    .max(10, "Max 10 gości")
    .required(),
  date: yup
    .string()
    .required("Wybierz datę")
    .test("is-future", "Data w przeszłości", (value) => {
      const today = new Date().toISOString().split("T")[0];
      return value >= today;
    }),
  time: yup
    .string()
    .required("Wybierz godzinę")
    .test("is-valid-time", "Godzina poza zakresem 08:00–20:00", (value) => {
      if (!value) return false;
      const hour = parseInt(value.split(":"[0]));
      return hour >= 8 && hour <= 20;
    }),
});

const ReservationForm = ({ onReservationSaved }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      guests: 1,
      date: "",
      time: "",
    },
  });

  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Rezerwacja zapisana!");
        onReservationSaved?.();
        reset();
      } else {
        alert("Coś poszło nie tak.");
      }
    } catch (err) {
      alert("Brak połączenia z serwerem.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-2xl text-black">
        <h1 className="text-4xl font-bold text-center mb-8">
          Rezerwacja stolika
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium">Imię</label>
            <input
              {...register("name")}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-black bg-white"
            />
            <p className="text-sm text-red-600">{errors.name?.message}</p>
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              {...register("email")}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-black bg-white"
            />
            <p className="text-sm text-red-600">{errors.email?.message}</p>
          </div>

          <div>
            <label className="block font-medium">Liczba gości</label>
            <input
              type="number"
              {...register("guests")}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-black bg-white"
            />
            <p className="text-sm text-red-600">{errors.guests?.message}</p>
          </div>

          <div>
            <label className="block font-medium">Data</label>
            <input
              type="date"
              {...register("date")}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-black bg-white"
            />
            <p className="text-sm text-red-600">{errors.date?.message}</p>
          </div>

          <div>
            <label className="block font-medium">Godzina</label>
            <input
              type="time"
              {...register("time")}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none text-black bg-white"
            />
            <p className="text-sm text-red-600">{errors.time?.message}</p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-2 text-white text-lg font-semibold hover:from-teal-700 hover:to-cyan-700 transition"
          >
            Zarezerwuj
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;

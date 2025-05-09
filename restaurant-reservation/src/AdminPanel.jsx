import React, { useEffect, useState } from "react";

const formatDate = (isoDate) => {
  if (
    !isoDate ||
    typeof isoDate !== "string" ||
    isoDate.split("-").length !== 3
  ) {
    return "";
  }
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

const AdminPanel = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    guests: "",
    date: "",
    time: "",
  });

  const fetchReservations = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReservations(data);
    } catch (err) {
      setError("Nie udało się pobrać rezerwacji.");
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setReservations((prev) => prev.filter((res) => res._id !== id));
      } else {
        alert("Błąd podczas usuwania rezerwacji.");
      }
    } catch (err) {
      alert("Nie udało się połączyć z serwerem.");
    }
  };
  const convertToISO = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  const updateReservation = async () => {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/;
    if (!dateRegex.test(editedData.date)) {
      alert("Nieprawidłowy format daty. Użyj DD-MM-RRRR.");
      return;
    }

    const [day, month, year] = editedData.date.split("-");
    const selectedDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      alert("Data nie może być wcześniejsza niż dzisiaj.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/reservations/${editingReservation._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editedData.name,
            email: editedData.email,
            guests: Number(editedData.guests),
            date: convertToISO(editedData.date),
            time: editedData.time,
          }),
        }
      );
      if (response.ok) {
        const updated = await response.json();
        setReservations((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
        setEditingReservation(null);
        setEditedData({});
      } else {
        alert("Błąd podczas zapisu edycji");
      }
    } catch (err) {
      alert("Błąd połączenia przy edycji");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleDateInputChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length >= 3) value = value.slice(0, 2) + "-" + value.slice(2);
    if (value.length >= 6) value = value.slice(0, 5) + "-" + value.slice(5);
    if (value.length > 10) value = value.slice(0, 10);
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/;
    if (value.length === 10 && !dateRegex.test(value)) {
      alert("Nieprawidłowy format daty. Użyj DD-MM-RRRR.");
      return;
    }
    setFilters((prev) => ({ ...prev, date: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      email: "",
      guests: "",
      date: "",
      time: "",
    });
  };

  const filteredReservations = reservations.filter((res) => {
    const formattedDate = formatDate(res.date);
    return (
      (!filters.name ||
        res.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.email ||
        res.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.guests || String(res.guests) === filters.guests) &&
      (!filters.date ||
        (filters.date.length <= 2 && formattedDate.startsWith(filters.date)) ||
        (filters.date.length === 5 &&
          formattedDate.slice(0, 5) === filters.date) ||
        (filters.date.length === 10 && formattedDate === filters.date)) &&
      (!filters.time || res.time.includes(filters.time))
    );
  });

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10 flex flex-col items-center">
      <button
        onClick={() => {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("token");
          window.location.href = "/admin";
        }}
        className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Wyloguj
      </button>

      <div className="w-screen">
        <h1 className="text-4xl font-bold text-center py-6 bg-white">
          Panel administratora
        </h1>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-4xl">
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <input
            type="text"
            name="name"
            placeholder="Filtruj po imieniu"
            value={filters.name}
            onChange={handleFilterChange}
            className="w-72 border border-gray-400 rounded px-3 py-2"
          />
          <input
            type="text"
            name="email"
            placeholder="Filtruj po emailu"
            value={filters.email}
            onChange={handleFilterChange}
            className="w-72 border border-gray-400 rounded px-3 py-2"
          />
          <input
            type="number"
            name="guests"
            placeholder="Filtruj po liczbie gości"
            value={filters.guests}
            onChange={handleFilterChange}
            className="w-72 border border-gray-400 rounded px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <input
            type="text"
            name="date"
            placeholder="Filtruj po dacie (dd-mm-rrrr)"
            value={filters.date}
            onChange={handleDateInputChange}
            className="w-72 border border-gray-400 rounded px-3 py-2"
          />
          <input
            type="text"
            name="time"
            placeholder="Filtruj po godzinie (hh:mm)"
            value={filters.time}
            onChange={handleFilterChange}
            className="w-72 border border-gray-400 rounded px-3 py-2"
          />
          <button
            onClick={resetFilters}
            className="w-72 px-4 py-2 bg-red-500 text-white font-semibold rounded"
          >
            Resetuj filtry
          </button>
        </div>
      </div>

      {loading && <p>Ładowanie...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-wrap gap-6 justify-center w-full max-w-[1300px] overflow-x-hidden">
          {filteredReservations.length === 0 ? (
            <div className="w-72 border p-4 rounded-xl shadow bg-white text-center text-gray-500">
              Brak rezerwacji pasujących do filtrów.
            </div>
          ) : (
            filteredReservations.map((res) => (
              <div
                key={res._id || `${res.email}-${res.date}-${res.time}`}
                className="w-72 border p-4 rounded-xl shadow bg-white"
              >
                <p>
                  <strong>Imię:</strong> {res.name}
                </p>
                <p>
                  <strong>Email:</strong> {res.email}
                </p>
                <p>
                  <strong>Goście:</strong> {res.guests}
                </p>
                <p>
                  <strong>Data:</strong> {formatDate(res.date)}
                </p>
                <p>
                  <strong>Godzina:</strong> {res.time}
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => {
                      setEditingReservation(res);
                      setEditedData(res);
                    }}
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => deleteReservation(res._id)}
                    className="px-4 py-2 bg-black text-red-500 rounded"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edytuj rezerwację</h2>
            <div className="space-y-3">
              <input
                className="w-full border px-3 py-2 rounded"
                value={editedData.name}
                onChange={(e) =>
                  setEditedData({ ...editedData, name: e.target.value })
                }
              />
              <input
                className="w-full border px-3 py-2 rounded"
                value={editedData.email}
                onChange={(e) =>
                  setEditedData({ ...editedData, email: e.target.value })
                }
              />
              <input
                type="number"
                className="w-full border px-3 py-2 rounded"
                value={editedData.guests}
                onChange={(e) =>
                  setEditedData({ ...editedData, guests: e.target.value })
                }
              />
              <input
                className="w-full border px-3 py-2 rounded"
                value={editedData.date || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, date: e.target.value })
                }
              />
              <input
                className="w-full border px-3 py-2 rounded"
                value={editedData.time}
                onChange={(e) =>
                  setEditedData({ ...editedData, time: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingReservation(null)}
                className="px-4 py-2 rounded bg-gray-600 text-white"
              >
                Anuluj
              </button>
              <button
                onClick={updateReservation}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

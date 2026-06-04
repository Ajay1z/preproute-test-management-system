import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { useTestStore } from "../store/testStore";
import { Test } from "../types/test";

const Dashboard = () => {
  const navigate = useNavigate();
  const { tests, fetchTests, isLoading, error } = useTestStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchTests().catch(() => toast.error("Unable to load tests"));
  }, [fetchTests]);

  const filteredTests = useMemo(
    () => tests.filter((test) => (test.name || "").toLowerCase().includes(query.trim().toLowerCase())),
    [query, tests]
  );

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (test: Test) => <span className="font-semibold text-slate-950">{test.name || "Untitled Test"}</span>
    },
    { key: "subject", header: "Subject", render: (test: Test) => test.subject || "-" },
    { key: "type", header: "Type", render: (test: Test) => <span className="capitalize">{test.type || "-"}</span> },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (test: Test) => <span className="capitalize">{test.difficulty || "-"}</span>
    },
    { key: "status", header: "Status", render: (test: Test) => <StatusBadge status={test.status || "draft"} /> },
    { key: "questions", header: "Questions", render: (test: Test) => test.total_questions || 0 },
    { key: "marks", header: "Marks", render: (test: Test) => test.total_marks || 0 },
    { key: "time", header: "Time", render: (test: Test) => `${test.total_time || 0} min` },
    {
      key: "actions",
      header: "Actions",
      render: (test: Test) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="min-h-9 px-3" onClick={() => navigate(`/tests/${test.id}/preview`)}>
            View
          </Button>
          <Button variant="ghost" className="min-h-9 px-3" onClick={() => navigate(`/tests/create?edit=${test.id}`)}>
            Edit
          </Button>
          <Button variant="danger" className="min-h-9 px-3" onClick={() => toast.info("Delete API is not available yet")}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">Manage tests from the live backend.</p>
        </div>
        <Button onClick={() => navigate("/tests/create")}>Create Test</Button>
      </div>

      <div className="panel p-4">
        <Input
          label="Search by test name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tests"
        />
      </div>

      {isLoading ? <Loader label="Fetching tests" /> : null}
      {error ? <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
      {!isLoading ? <Table columns={columns} data={filteredTests} emptyMessage="No tests found." /> : null}
    </section>
  );
};

export default Dashboard;

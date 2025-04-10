// src/app/debug/database/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DatabaseTestPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testArticle, setTestArticle] = useState<any>(null);
  const [testArticleStatus, setTestArticleStatus] = useState<string | null>(
    null
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTables();
    }
  }, [user]);

  async function fetchTables() {
    try {
      setLoading(true);
      setError(null);

      // This query gets all tables in the public schema
      const { data, error } = await (supabase as any).rpc("list_tables");

      if (error) throw error;

      setTables(data || []);

      // Try to select public_articles by default if it exists
      if (data && data.includes("public_articles")) {
        setSelectedTable("public_articles");
        fetchTableDetails("public_articles");
      }
    } catch (err: any) {
      console.error("Error fetching tables:", err);
      setError(`Failed to fetch tables: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTableDetails(tableName: string) {
    try {
      setLoading(true);
      setError(null);
      setColumns([]);
      setRecords([]);

      // Fetch column information
      const { data: columnData, error: columnError } = await (
        supabase as any
      ).rpc("list_columns", { table_name: tableName });

      if (columnError) throw columnError;

      setColumns(columnData || []);

      // Fetch records (limited to 10)
      const { data: recordData, error: recordError } = await (supabase as any)
        .from(tableName)
        .select("*")
        .limit(10);

      if (recordError) throw recordError;

      setRecords(recordData || []);
    } catch (err: any) {
      console.error(`Error fetching details for table ${tableName}:`, err);
      setError(`Failed to fetch table details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleTableChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tableName = e.target.value;
    setSelectedTable(tableName);

    if (tableName) {
      await fetchTableDetails(tableName);
    } else {
      setColumns([]);
      setRecords([]);
    }
  }

  async function createTestArticle() {
    try {
      setLoading(true);
      setError(null);
      setTestArticle(null);
      setTestArticleStatus(null);

      if (!user) {
        setError("You must be logged in to create a test article");
        return;
      }

      // Check if public_articles table exists
      const tableExists = tables.includes("public_articles");

      if (!tableExists) {
        setError(
          "The public_articles table does not exist. Please run a database migration or create the table first."
        );
        return;
      }

      // Create test article data
      const testSlug = `test-article-${Date.now()}`;
      const articleData = {
        user_id: user.id,
        title: `Test Article ${new Date().toLocaleTimeString()}`,
        content:
          "This is a test article created from the database testing tool.",
        excerpt: "Test article excerpt",
        category: "test-category",
        slug: testSlug,
        is_published: true,
        published_at: new Date().toISOString(),
        view_count: 0,
      };

      // Insert the test article
      const { data, error } = await (supabase as any)
        .from("public_articles")
        .insert(articleData)
        .select();

      if (error) throw error;

      setTestArticle(data[0]);
      setTestArticleStatus("Test article created successfully!");

      // Refresh the table data
      await fetchTableDetails("public_articles");
    } catch (err: any) {
      console.error("Error creating test article:", err);
      setError(`Failed to create test article: ${err.message}`);
      setTestArticleStatus("Failed to create test article.");
    } finally {
      setLoading(false);
    }
  }

  // Function to create the public_articles table if it doesn't exist
  async function ensurePublicArticlesTable() {
    try {
      setLoading(true);
      setError(null);
      setImportStatus(null);

      if (!user) {
        setError("You must be logged in to create the table");
        return;
      }

      // First check if the table already exists
      if (tables.includes("public_articles")) {
        setImportStatus("public_articles table already exists!");
        return;
      }

      // Create the public_articles table using SQL
      const { error } = await (supabase as any).rpc(
        "create_public_articles_table"
      );

      if (error) throw error;

      setImportStatus("public_articles table created successfully!");

      // Refresh the tables list
      await fetchTables();
    } catch (err: any) {
      console.error("Error creating public_articles table:", err);
      setError(`Failed to create table: ${err.message}`);
      setImportStatus("Failed to create public_articles table.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Test Tool</h1>

      {/* Auth Status */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
        {user ? (
          <div className="bg-green-100 text-green-800 p-3 rounded">
            ✅ Authenticated as: {user.email} (ID: {user.id})
          </div>
        ) : (
          <div>
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              ❌ Not authenticated
            </div>
            <p className="mb-4">You need to sign in to use this tool.</p>
            <Link
              href="/signin"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {user && (
        <>
          {/* Table Creation Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Table Management</h2>

            <div className="mb-4">
              <button
                onClick={ensurePublicArticlesTable}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
              >
                {loading ? "Working..." : "Create public_articles Table"}
              </button>

              {importStatus && (
                <div
                  className={`mt-4 p-3 rounded ${
                    importStatus.includes("Failed")
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {importStatus}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p>
                This will create the public_articles table if it doesn't exist.
                The table will have the following columns:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>id (uuid, primary key)</li>
                <li>user_id (uuid, references auth.users)</li>
                <li>title (text)</li>
                <li>content (text)</li>
                <li>excerpt (text)</li>
                <li>slug (text, unique)</li>
                <li>category (text)</li>
                <li>is_published (boolean)</li>
                <li>published_at (timestamp)</li>
                <li>view_count (integer)</li>
                <li>image_url (text)</li>
                <li>created_at (timestamp with default)</li>
              </ul>
            </div>
          </div>

          {/* Table Explorer Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Database Explorer</h2>

            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Table</label>
              <select
                value={selectedTable}
                onChange={handleTableChange}
                className="w-full p-2 border rounded"
                disabled={loading}
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>

            {selectedTable && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Table: {selectedTable}</h3>

                  {selectedTable === "public_articles" && (
                    <button
                      onClick={createTestArticle}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {loading ? "Creating..." : "Create Test Article"}
                    </button>
                  )}
                </div>

                {testArticleStatus && (
                  <div
                    className={`mb-4 p-3 rounded ${
                      testArticleStatus.includes("Failed")
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {testArticleStatus}
                    {testArticle && (
                      <div className="mt-2">
                        <p>Article created with ID: {testArticle.id}</p>
                        <p>Title: {testArticle.title}</p>
                        <p>Slug: {testArticle.slug}</p>
                        <Link
                          href={`/articles/${testArticle.slug}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                        >
                          View Article →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Columns</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    {columns.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {columns.map((column) => (
                          <span
                            key={column}
                            className="inline-block bg-gray-200 px-2 py-1 rounded text-sm"
                          >
                            {column}
                          </span>
                        ))}
                      </div>
                    ) : loading ? (
                      <p>Loading columns...</p>
                    ) : (
                      <p>No columns found.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Records (limited to 10)</h4>

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : records.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(records[0]).map((key) => (
                              <th
                                key={key}
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {records.map((record, index) => (
                            <tr key={index}>
                              {Object.entries(record).map(([key, value]) => (
                                <td
                                  key={key}
                                  className="px-4 py-2 whitespace-nowrap text-sm"
                                >
                                  {typeof value === "object"
                                    ? JSON.stringify(value).substring(0, 50) +
                                      (JSON.stringify(value).length > 50
                                        ? "..."
                                        : "")
                                    : String(value).substring(0, 50) +
                                      (String(value).length > 50 ? "..." : "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No records found.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Navigation</h2>

            <div className="space-y-2">
              <div>
                <Link
                  href="/debug/profile"
                  className="text-blue-600 hover:text-blue-800"
                >
                  → Go to Profile Diagnostics
                </Link>
              </div>

              <div>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-800"
                >
                  → Go to Your Profile
                </Link>
              </div>

              {user && (
                <div>
                  <Link
                    href={`/profile/${user.id}/articles`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    → Go to Your Articles Page
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

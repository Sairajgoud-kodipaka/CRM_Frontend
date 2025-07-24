export default function SettingsHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Business Admin Settings</h1>
      <p className="text-gray-700 mb-6 max-w-2xl">
        Welcome to the centralized settings panel for your jewelry business. Here you can manage stores, teams, tags, notifications, branding, legal policies, and more—all in one place. Use the sidebar to navigate between different settings sections.
      </p>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-900 rounded">
        <strong>Tip:</strong> Only business-admins can access and edit these settings. Changes here affect your entire business CRM experience.
      </div>
    </div>
  );
} 
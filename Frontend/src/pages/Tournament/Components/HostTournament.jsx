import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const defaultData = {
  tournamentName: "",
  description: "",
  location: "",
  format: "KNOCKOUT",
  startDate: "",
  endDate: "",
  prizePool: "",
  entryFee: "",
  skillLevel: "All Levels",
  maxTeams: "",
};

const CreateTournament = ({ isOpen, onClose, onCreateTournament }) => {
  const [formData, setFormData] = useState(defaultData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTournament(formData);
    setFormData(defaultData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-md">
          <motion.div initial={{ y: 18, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }} className="app-card w-full max-w-md overflow-hidden">
            <div className="sticky top-0 border-b border-slate-200 bg-white p-6 dark:bg-slate-900">
              <h2 className="text-2xl font-bold">Host New Tournament</h2>
              <p className="mt-1 text-sm text-slate-500">Set up a new tournament for teams to compete</p>
              <button onClick={onClose} className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center text-2xl leading-none text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto p-6">
              <input type="text" name="tournamentName" placeholder="Tournament Name" value={formData.tournamentName} onChange={handleInputChange} required className="w-full px-4 py-2" />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full resize-none px-4 py-2" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2" />
                <select name="format" value={formData.format} onChange={handleInputChange} className="w-full cursor-pointer px-4 py-2">
                  <option value="KNOCKOUT">Knockout</option><option value="LEAGUE">League / Round Robin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-2" />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="prizePool" placeholder="Prize Pool" value={formData.prizePool} onChange={handleInputChange} className="w-full px-4 py-2" />
                <input type="text" name="entryFee" placeholder="Entry Fee" value={formData.entryFee} onChange={handleInputChange} className="w-full px-4 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="skillLevel" value={formData.skillLevel} onChange={handleInputChange} className="w-full cursor-pointer px-4 py-2">
                  <option value="All Levels">All Levels</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="Professional">Professional</option>
                </select>
                <input type="number" name="maxTeams" placeholder="Max Teams" value={formData.maxTeams} onChange={handleInputChange} className="w-full px-4 py-2" />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button" onClick={onClose} className="btn-secondary px-6 py-2 text-slate-700">Cancel</motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="btn-primary px-6 py-2">Host Tournament</motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateTournament;

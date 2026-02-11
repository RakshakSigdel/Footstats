import ScheduleService from "../services/scheduleService";

export const createSchedule = async (req, res) => {
  try {
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating Club", error: error.message });
  }
};

export const getAllSchedules = async (req,res) =>{
    try{
        
    }
    catch(error){
        res.status(500).json({message:"Error Fetching Your Schedules",error:error.message});
    }
}

export const getScheduleById = async (req,res) =>{
    try{

    }
    catch(error){
        res.status(500).json({message:"Error Fetching Schedule"})
    }
}

export const getMySchedules = async (req,res) =>{
    try{

    }
    catch(error){
        res.status(500).json({message:"Error Fetching Your Schedules",error:error.message})
    }
}

export const getClubSchedules = async (req,res) =>{
    try{

    }
    catch(error){
        res.status(500).json({message:"Error Fetching Your schedule",error:error.message})
    }
}

export const UpdateSchedule = async(req,res)=>{
    try{

    }
    catch(error){
        res.status(500).json({message:"Failed to Upload Schedule",error:error.message})
    }
}

export const deleteSchedule =async(req,res) =>{
    try{

    }
    catch(error){
        res.status(500).json({message:"Failed to delete Schedule",error:error.message})
    }
}
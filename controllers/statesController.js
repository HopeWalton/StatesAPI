const statesData = require('../models/statesData.json');
const State = require('../models/State');

const getAllStates = async (req, res) => {
    const contigParam = req.query.contig;
  
    let filteredStates;
  
    if (contigParam === 'true') {
      // Exclude AK and HI
      filteredStates = statesData.filter(
        (state) => state.code !== 'AK' && state.code !== 'HI'
      );
    } else if (contigParam === 'false') {
      // Only AK and HI
      filteredStates = statesData.filter(
        (state) => state.code === 'AK' || state.code === 'HI'
      );
    } else {
      // If contig is not provided or invalid, return all
      filteredStates = statesData;
    }

// Merge in funfacts from MongoDB
try {
    const mongoStates = await State.find(); // gets all states with funfacts

    // For each state in the filtered array, check if funfacts exist and add them
    const mergedStates = filteredStates.map((state) => {
      const match = mongoStates.find((mongo) => mongo.stateCode === state.code);
      if (match && match.funfacts) {
        return { ...state, funfacts: match.funfacts };
      }
      return state;
    });

    res.json(mergedStates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

const getState = async (req, res) => {
    const code = req.code;

    const state = statesData.find(s => s.code === req.code);
    try {
        const mongoState = await State.findOne({ stateCode: code });
        if(mongoState && mongoState.funfacts) {
            state.funfacts = mongoState.funfacts;
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Database error'});
    }

    res.json(state);
};

const getCapital = (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    res.json({
        'state': state.state,
        'capital': state.capital_city
    });
}

const getNickname = (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    res.json({
        'state': state.state,
        'nickname': state.nickname
    });
};

const getPopulation = (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    res.json({
        'state': state.state,
        population: state.population.toLocaleString('en-US')
    });
};

const getAdmission = (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    res.json({
        'state': state.state,
        'admitted': state.admission_date
    });
};

const getFunfact = async (req, res) => {
    const code = req.code;
    const state = statesData.find(s => s.code === code);
  
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }
  
    try {
      const mongoState = await State.findOne({ stateCode: code });
  
      if (!mongoState || !mongoState.funfacts || mongoState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
      }
  
      const funfacts = mongoState.funfacts;
      const randomIndex = Math.floor(Math.random() * funfacts.length);
      const funFact = funfacts[randomIndex];
  
      return res.json({ funfact: funFact });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
  };

  const postFunfact = async (req, res) => {
    const code = req.code;
    const state = statesData.find(s => s.code === code);
    const { funfacts } = req.body;
  
    // ✅ Check if funfacts is defined at all
    if (funfacts === undefined) {
      return res.status(400).json({ message: 'State fun facts value required' });
    }
  
    // ✅ Then check that it's actually an array
    if (!Array.isArray(funfacts)) {
      return res.status(400).json({ message: 'State fun facts value must be an array' });
    }
  
    try {
      const existingState = await State.findOne({ stateCode: code });
  
      if (existingState) {
        existingState.funfacts.push(...funfacts);
        const updated = await existingState.save();
        return res.status(201).json(updated);
      } else {
        const newState = await State.create({
          stateCode: code,
          funfacts: funfacts
        });
        return res.status(201).json(newState);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
  };
  

  const patchFunfact = async (req, res) => {
    const code = req.code;
    const { index, funfact } = req.body;
  
    if (!index) {
      return res.status(400).json({ message: 'State fun fact index value required' });
    }
  
    if (!funfact) {
      return res.status(400).json({ message: 'State fun fact value required' });
    }
  
    try {
      const mongoState = await State.findOne({ stateCode: code });
      const stateName = statesData.find(s => s.code === code)?.state;
  
      if (!mongoState || !mongoState.funfacts || mongoState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
      }
  
      const arrayIndex = index - 1;
  
      if (arrayIndex < 0 || arrayIndex >= mongoState.funfacts.length) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateName}` });
      }
  
      mongoState.funfacts[arrayIndex] = funfact;
  
      const updatedDoc = await mongoState.save();
      res.status(200).json(updatedDoc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  };  

  const deleteFunfact = async (req, res) => {
    const code = req.code;
    const { index } = req.body;
  
    if (!index) {
      return res.status(400).json({ message: 'State fun fact index value required' });
    }
  
    try {
      const mongoState = await State.findOne({ stateCode: code });
      const stateName = statesData.find(s => s.code === code)?.state;
  
      if (!mongoState || !Array.isArray(mongoState.funfacts) || mongoState.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
      }
  
      const arrayIndex = index - 1;
  
      if (arrayIndex < 0 || arrayIndex >= mongoState.funfacts.length) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateName}` });
      }
  
      // Remove the specific item at the index
      mongoState.funfacts.splice(arrayIndex, 1);
  
      const updatedDoc = await mongoState.save();
      res.status(200).json(updatedDoc);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  };
  

module.exports = {
    getAllStates,
    getState,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    getFunfact, 
    postFunfact,
    patchFunfact,
    deleteFunfact
}
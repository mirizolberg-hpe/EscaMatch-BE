const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;
app.use(cors());

const LISTS_FILE = 'lists.json';

function init() {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    const superCases = data.SuperCases;

    const llmCategories = [...new Set(superCases.map(item => item.LLM_Category))];
    const llmSubCategories = [...new Set(superCases.map(item => item.LLM_SubCategory))];
    const versions = [...new Set(superCases.flatMap(item => item.LinkedSFTickets.map(ticket => ticket.version)))];

    superCases.forEach(item => {
        item.Calculated = item.LinkedSFTickets.length;
    });

    superCases.sort((a, b) => b.Calculated - a.Calculated);

    const listsData = {
        LLM_Category: llmCategories,
        LLM_SubCategory: llmSubCategories,
        Version: versions,
        SuperCases: superCases
    };
    fs.writeFileSync(LISTS_FILE, JSON.stringify(listsData, null, 2), 'utf-8');
}

app.get('/lists', (req, res) => {
    try {
        const listsData = JSON.parse(fs.readFileSync(LISTS_FILE, 'utf-8'));
        res.json({
            LLM_Category: listsData.LLM_Category,
            LLM_SubCategory: listsData.LLM_SubCategory,
            Version: listsData.Version
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load lists' });
    }
});

app.get('/filtered-list', (req, res) => {
    const { value, count } = req.query;
    console.log("value ",value )

    try {
        const listsData = JSON.parse(fs.readFileSync(LISTS_FILE, 'utf-8'));
        
        let filteredCases = listsData.SuperCases;

        if (value) {
            filteredCases = filteredCases.filter(
                item => item.LLM_Category === value ||
                        item.LLM_SubCategory === value ||
                        item.LinkedSFTickets.some(ticket => ticket.version === value)
            );
        }

        if (count) {
            filteredCases = filteredCases.slice(0, parseInt(count));
        }

        res.json(filteredCases);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load cases' });
    }
});


//init();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

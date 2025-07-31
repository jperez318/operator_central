import React, { useState, useEffect } from "react";
import axios from "axios";
import SwitchPointsButton from "../components/SwitchPointsButton";

export default function OperatorOTMBoard() {
  const [operators, setOperators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pointsMap, setPointsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [operatorsRes, categoriesRes, pointsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE}/operators`),
          axios.get(`${process.env.REACT_APP_API_BASE}/ootm_categories`),
          axios.get(`${process.env.REACT_APP_API_BASE}/points`)
        ]);

        setOperators(operatorsRes.data);
        setCategories(categoriesRes.data);
        setPointsMap(
            Object.fromEntries(pointsRes.data.map(p => [p.operator_id, p.points]))
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddPoints = async (operatorId, points) => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_BASE}/add_points`, {
        operator_id: operatorId,
        points: points
      });

      setPointsMap(prev => ({
        ...prev,
        [operatorId]: res.data.new_points
      }));
    } catch (error) {
      console.error("Error adding points:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  const switch_points = async () => {
    try {
        const res = await axios.patch(`${process.env.REACT_APP_API_BASE}/new_month`);
        if (res.data.success) {
            setPointsMap(prev => {
                const newMap = { ...prev };
                Object.keys(newMap).forEach(key => {
                    newMap[key] = 0;
                });
                return newMap;
            });
        }
    } catch (error) {
        console.error("Error switching points:", error);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign:"center"}}>Operator of the Month Board</h1>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <SwitchPointsButton switch_points={switch_points} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
            <th style={{ fontSize: "1.2rem", padding: "10px" }}>Operator</th>
            {categories.map(cat => (
                <th key={cat.id} style={{ fontSize: "1.2rem", padding: "10px" }}>
                {cat.name}
                </th>
            ))}
            <th style={{ fontSize: "1.2rem", padding: "10px" }}>Total Points</th>
            </tr>
        </thead>
        <tbody style={{ textAlign:"center"}}>
          {[...operators]
            .sort((a, b) => (pointsMap[b.id] || 0) - (pointsMap[a.id] || 0))
            .map(op => (
            <tr key={op.id}>
                <td>{op.name}</td>
                {categories.map(cat => (
                <td key={cat.id} style ={{ textAlign: "center", padding:"5px"}} >
                    <button 
                        onClick={() => handleAddPoints(op.id, cat.points)}
                        style={{
                            backgroundColor: "#24477F",
                            color: "white",
                            border: "2px",
                            borderRadius: "20px",
                            padding: "6px 12px",
                            cursor: "pointer"
                        }}
                    >
                    {cat.points > 0 ? "+" : ""}{cat.points}
                    </button>
                </td>
                ))}
                <td style={{ textAlign:"center"}}>{pointsMap[op.id] || 0}</td>
            </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

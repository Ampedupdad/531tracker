import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { styled } from "nativewind";

const SView = styled(View);
const SText = styled(Text);
const STextInput = styled(TextInput);
const STouchableOpacity = styled(TouchableOpacity);

export default function App() {
  const [lifts, setLifts] = useState({
    squat: 315,
    bench: 225,
    deadlift: 405,
    press: 135,
  });
  const [cycleCount, setCycleCount] = useState(1);
  const [plan, setPlan] = useState(null);

  const template = {
    week1: [{ pct: 0.65, reps: 5 }, { pct: 0.75, reps: 5 }, { pct: 0.85, reps: "5+" }],
    week2: [{ pct: 0.70, reps: 3 }, { pct: 0.80, reps: 3 }, { pct: 0.90, reps: "3+" }],
    week3: [{ pct: 0.75, reps: 5 }, { pct: 0.85, reps: 3 }, { pct: 0.95, reps: "1+" }],
    week4: [{ pct: 0.40, reps: 5 }, { pct: 0.50, reps: 5 }, { pct: 0.60, reps: 5 }],
  };

  function roundWeight(weight) {
    return Math.round(weight / 5) * 5;
  }

  function calcTM(lift1RM) {
    return Math.round(lift1RM * 0.9);
  }

  function generateCycle({ liftsObj }) {
    const cycle = {};
    Object.entries(liftsObj).forEach(([liftName, lift1RM]) => {
      const tm = calcTM(lift1RM);
      const weeks = [];
      Object.entries(template).forEach(([weekName, sets]) => {
        const setRows = sets.map((s) => ({
          pct: s.pct,
          reps: s.reps,
          weight: roundWeight(tm * s.pct),
        }));
        weeks.push({ weekName, sets: setRows });
      });
      cycle[liftName] = { trainingMax: tm, weeks };
    });
    return cycle;
  }

  function generateProgram() {
    const cycles = [];
    for (let c = 1; c <= cycleCount; c++) {
      cycles.push({ cycleNumber: c, content: generateCycle({ liftsObj: lifts }) });
    }
    setPlan({ generatedAt: new Date().toISOString(), cycles });
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SView className="bg-white rounded-2xl shadow p-4">
          <SText className="text-2xl font-bold mb-2">Wendler 5/3/1 Planner</SText>
          <SText className="text-sm text-gray-600 mb-4">Enter your lifts and generate cycles</SText>

          {Object.entries(lifts).map(([k, v]) => (
            <SView key={k} className="mb-3">
              <SText className="capitalize text-sm mb-1">{k} 1RM</SText>
              <STextInput
                className="border rounded px-2 py-1"
                keyboardType="numeric"
                value={String(v)}
                onChangeText={(val) => setLifts({ ...lifts, [k]: Number(val) })}
              />
            </SView>
          ))}

          <SView className="mb-3">
            <SText className="text-sm mb-1">Cycles</SText>
            <STextInput
              className="border rounded px-2 py-1"
              keyboardType="numeric"
              value={String(cycleCount)}
              onChangeText={(val) => setCycleCount(Number(val))}
            />
          </SView>

          <STouchableOpacity onPress={generateProgram} className="bg-indigo-600 rounded py-2 mt-2">
            <SText className="text-center text-white font-semibold">Generate Plan</SText>
          </STouchableOpacity>
        </SView>

        {plan && (
          <SView className="mt-6">
            {plan.cycles.map((cycle) => (
              <SView key={cycle.cycleNumber} className="mb-6 bg-white rounded-xl shadow p-4">
                <SText className="font-bold mb-2">Cycle {cycle.cycleNumber}</SText>
                {Object.entries(cycle.content).map(([liftName, info]) => (
                  <SView key={liftName} className="mb-4">
                    <SText className="font-semibold capitalize mb-1">
                      {liftName} — TM {info.trainingMax} lbs
                    </SText>
                    {info.weeks.map((w, idx) => (
                      <SView key={idx} className="mb-2">
                        <SText className="text-sm font-medium">
                          Week {idx + 1} ({w.weekName})
                        </SText>
                        {w.sets.map((s, i) => (
                          <SText key={i} className="text-xs text-gray-700">
                            Set {i + 1}: {(s.pct * 100).toFixed(0)}% × {s.reps} @ {s.weight} lbs
                          </SText>
                        ))}
                      </SView>
                    ))}
                  </SView>
                ))}
              </SView>
            ))}
          </SView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
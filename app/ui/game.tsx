"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import UserInfo from "./userinfo";

const RADIUS = 25;
const CIRCLES_TOTAL = 50;
const GRID_SIZE = 50;
const COLS = 500 / GRID_SIZE;
const ROWS = 300 / GRID_SIZE;

type GameState = {
  apm: number;
  time: number;
  clicks: number;
  hits: number;
  wrongHits: number;
};

export default function Game({ user }: { user: User | null }) {
  const supabase = createClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<number>(0);
  const [selectedCircles, setSelectedCircles] = useState(6);
  const [resetToggle, setResetToggle] = useState(false);
  const [fps, setFps] = useState(0);
  const [isHs, setIsHs] = useState(false);
  const [hs, setHs] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    apm: 0,
    time: 0,
    clicks: 0,
    hits: 0,
    wrongHits: 0,
  });

  let occupiedCells = Array(ROWS)
    .fill(false)
    .map(() => Array(COLS).fill(false));

  var timeStart: number;
  var timeEnd: number;

  let circles: {
    arr: { x: number; y: number; n: number }[];
    pos: number;
  } = {
    arr: [],
    pos: CIRCLES_TOTAL,
  };

  function getCircle() {
    return {
      x: getRndX(),
      y: getRndY(),
      n: circles.pos,
    };
  }

  function getRndX() {
    return Math.floor(Math.random() * COLS) * GRID_SIZE + GRID_SIZE / 2;
  }

  function getRndY() {
    return Math.floor(Math.random() * ROWS) * GRID_SIZE + GRID_SIZE / 2;
  }

  const getHighestApm = useCallback(async () => {
    try {
      if (!user) return 0;

      const { data, error } = await supabase
        .from("scores")
        .select("apm, time")
        .eq("user_id", user?.id)
        .eq("targets", selectedCircles)
        .order("apm", { ascending: false })
        .limit(1);

      if (error) throw error;

      const highestApm = data[0]?.apm || 0;
      const bestTime = data[0]?.time || 0;
      setHs(highestApm);
      setBestTime(bestTime);
      return highestApm;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }, [user, supabase, selectedCircles]);

  async function addScore({
    apm,
    time,
    selectedCircles,
  }: {
    apm: number | null;
    time: number | null;
    selectedCircles: number | null;
  }) {
    if (!user) return;

    try {
      if (!user) {
        console.log("no user");
        throw new Error("Unauthorized");
      }

      const { error } = await supabase.from("scores").insert({
        user_id: user?.id,
        apm,
        time,
        targets: selectedCircles,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Unauthorized") {
          console.error("you are not authorized to add this score");
        } else {
          console.error(`error adding score: ${error.message}`);
        }
      } else {
        console.error("an unexpected error occurred");
      }
    }
  }

  function resetStats() {
    setIsHs(false);
    setGameState({
      apm: 0,
      time: 0,
      clicks: 0,
      hits: 0,
      wrongHits: 0,
    });
  }

  async function handleHit(
    pixiApp: PIXI.Application,
    target: PIXI.Container,
    targett: { x: number; y: number; n: number },
  ) {
    if (targett.n == circles.pos + selectedCircles) {
      if (targett.n == CIRCLES_TOTAL) timeStart = new Date().getTime();
      pixiApp.stage.removeChild(target);

      if (circles.pos > 0) {
        spawnCircle(pixiApp);
      }
      occupiedCells[targett.y / (RADIUS * 2) - 0.5][
        targett.x / (RADIUS * 2) - 0.5
      ] = false;
      circles.pos -= 1;
      setGameState((prevState) => ({
        ...prevState,
        hits: prevState.hits + 1,
      }));
    } else {
      setGameState((prevState) => ({
        ...prevState,
        wrongHits: prevState.wrongHits + 1,
      }));
    }

    if (circles.pos + selectedCircles <= 0) {
      timeEnd = new Date().getTime();
      const time = timeEnd - timeStart;
      const timeFormated = time / 1000;
      var apm = Math.ceil((CIRCLES_TOTAL / time) * 1e3 * 60 * 1.8);
      setGameState((prevState) => ({
        ...prevState,
        clicks: prevState.clicks + 1,
        apm: apm,
        time: timeFormated,
      }));

      const highestApm = await getHighestApm();
      if (apm > highestApm) {
        getHighestApm();
        setIsHs(true);
      }
      addScore({ apm, time, selectedCircles });
    }
  }

  function spawnCircle(pixiApp: PIXI.Application) {
    let circle = {
      x: 0,
      y: 0,
      n: circles.pos,
    };

    let x = 0;
    let y = 0;
    do {
      circle = getCircle();
      x = circle.x / (RADIUS * 2) - 0.5;
      y = circle.y / (RADIUS * 2) - 0.5;
    } while (occupiedCells[y][x]);

    occupiedCells[y][x] = true;

    drawCircle(pixiApp, circle);
  }

  function drawCircle(
    pixiApp: PIXI.Application,
    circle: { x: number; y: number; n: number },
  ) {
    const target = new PIXI.Graphics();
    target.lineStyle(2, 0x333333, 1);
    target.beginFill(0x666666);
    target.drawCircle(circle.x, circle.y, RADIUS);
    target.endFill();

    const text = new PIXI.Text(circle.n.toString(), {
      fontFamily: "Arial",
      fontSize: 20,
      fill: "fff",
      align: "center",
    });
    text.x = circle.x - text.width / 2;
    text.y = circle.y - text.height / 2;

    target.addChild(text);

    target.eventMode = "static";
    target.on("pointerdown", () => handleHit(pixiApp, target, circle));

    pixiApp.stage.addChild(target);
  }

  useEffect(() => {
    const pixiApp = new PIXI.Application({
      width: 500,
      height: 300,
      antialias: true,
      resolution: 1,
    });

    if (canvasRef.current && pixiApp.view instanceof HTMLCanvasElement) {
      canvasRef.current.appendChild(pixiApp.view);
    }

    PIXI.Ticker.shared.add(() => {
      fpsRef.current = PIXI.Ticker.shared.FPS;
    });

    const fpsInterval = setInterval(() => {
      setFps(fpsRef.current);
    }, 500);

    for (let i = 0; i < selectedCircles; i++) {
      if (circles.pos > 0) {
        spawnCircle(pixiApp);
        circles.pos -= 1;
      }
    }

    getHighestApm();

    const keyDownHandler = (e: any) => {
      if (
        e.key === "r" ||
        e.code === "KeyR" ||
        e.which === "82" ||
        e.key === " " ||
        e.code === "Space" ||
        e.which === "32"
      ) {
        resetStats();
        setResetToggle(!resetToggle);
      }
    };
    document.addEventListener("keydown", keyDownHandler);

    return () => {
      clearInterval(fpsInterval);
      pixiApp.destroy(true, { children: true });
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [selectedCircles, resetToggle]);

  function handleReset() {
    resetStats();
    setResetToggle(!resetToggle);
    setResetToggle(!resetToggle);
  }

  const changeSelectOptionHandler = (event: any) => {
    resetStats();
    setSelectedCircles(Number(event.target.value));
  };

  const handleClick = () => {
    if (!gameState.apm) {
      setGameState((prevState) => ({
        ...prevState,
        clicks: prevState.clicks + 1,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-full px-4 justify-between text-sm">
        <div className="flex max-w-full items-start">
          <label htmlFor="targets" className="opacity-50">
            targets:{" "}
          </label>
          <select
            className="bg-black text-white rounded-none outline-none hover:opacity-70"
            name="targets"
            id="targets"
            defaultValue={"6"}
            onChange={changeSelectOptionHandler}
          >
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <option value={10 - i} key={10 - i}>
                  {10 - i}
                </option>
              ))}
          </select>
        </div>
        <UserInfo user={user} />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center border border-dashed border-neutral-800">
          <div
            className="min-w-[500px] min-h-[300px] border border-dashed border-neutral-800"
            ref={canvasRef}
            onClick={handleClick}
          ></div>
        </div>
        <div className="flex justify-between px-4 py-2 text-sm">
          <div className="w-full max-w-[260px]">
            <div className="flex justify-between font-bold">
              <p>APM</p>
              {isHs ? (
                <p className="text-amber-200">{gameState.apm}</p>
              ) : (
                <p>{gameState.apm}</p>
              )}
            </div>
            <div className="flex justify-between font-bold">
              <p>TIME</p>
              <p>{gameState.time}</p>
            </div>
            <div className="flex justify-between">
              <p>clicks</p>
              <p>{gameState.clicks}</p>
            </div>
            <div className="flex justify-between">
              <p>hits</p>
              <p>{gameState.hits}</p>
            </div>
            <div className="flex justify-between">
              <p>wrong hits</p>
              <p>{gameState.wrongHits}</p>
            </div>
            <div className="flex justify-between">
              <p>misses</p>
              <p>{gameState.clicks - gameState.hits}</p>
            </div>
            <div className="flex justify-between">
              <p>targets</p>
              <p>{selectedCircles}</p>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="flex flex-col gap-2">
              <div className="text-end">
                <p className="opacity-50">FPS: {fps.toFixed(2)}</p>
              </div>
              {hs ? (
                <div className="flex gap-2 font-bold">
                  <p>HS[{selectedCircles}]</p>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between">
                      <p>APM</p>
                      <p>{hs}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>TIME</p>
                      <p>{(bestTime as number) / 1000}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 font-bold">
                  <p>HS[{selectedCircles}]</p>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between">
                      <p>APM</p>
                      <p>...</p>
                    </div>
                    <div className="flex justify-between">
                      <p>TIME</p>
                      <p>...</p>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-gray-400">
                press <strong className="text-white">r</strong> or{" "}
                <strong className="text-white">space</strong> to{" "}
                <button onClick={handleReset} className="outline-none">
                  restart
                </button>
              </p>
            </div>
            <Link href="/leaderboard" className="hover:underline">
              leaderboard {"->"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import UserInfo from "./userinfo";
import { type User } from "@supabase/supabase-js";

const RADIUS = 25;
const CIRCLES = 10;

export default function Game({ user }: { user: User | null }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [clicks, setClicks] = useState(0);
  const [hits, setHits] = useState(0);
  const [wrongHits, setWrongHits] = useState(0);
  const [selectedCircles, setSelectedCircles] = useState(6);
  const [resetToggle, setResetToggle] = useState(false);
  const [time, setTime] = useState(0);
  const [apm, setApm] = useState(0);

  var timeStart: number;
  var timeEnd: number;

  function resetStats() {
    numbers.arr = [];
    setTime(0);
    setApm(0);
    setClicks(0);
    setHits(0);
    setWrongHits(0);
  }

  let numbers: {
    arr: { x: number; y: number; n: number }[];
    pos: number;
  } = {
    arr: [],
    pos: CIRCLES,
  };

  function getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function spawnCircle(numbers: {
    arr: { x: number; y: number; n: number }[];
    pos: number;
  }) {
    console.log("spawn");
    var circle = {
      x: getRndInteger(RADIUS, 500 - RADIUS),
      y: getRndInteger(RADIUS, 300 - RADIUS),
      n: numbers.pos,
    };
    if (numbers.pos > 0) {
      numbers.pos -= 1;
      numbers.arr.push(circle);
      return;
    }
  }

  const handleHit = (pixiApp: any, target: PIXI.Container, n: number) => {
    console.log("n: ", n);
    console.log("numbers.pos: ", numbers.pos);

    if (n == numbers.arr[0].n) {
      if (n == CIRCLES) timeStart = new Date().getTime();
      console.log("hit");
      pixiApp.stage.removeChild(target);
      setHits((hits) => hits + 1);
      numbers.arr.shift();
      spawnCircle(numbers);
      drawCircles(pixiApp, numbers.arr);
      console.log(numbers.arr);
    } else {
      setWrongHits((wrongHits) => wrongHits + 1);
    }
  };

  function drawCircles(
    pixiApp: any,
    arr: { x: number; y: number; n: number }[],
  ) {
    pixiApp.stage.removeChildren();

    if (arr.length == 0) {
      console.log("acabou");
      timeEnd = new Date().getTime();
      console.log(timeEnd - timeStart);
      const time = timeEnd - timeStart;
      const timeFormated = time / 1000;
      setTime(timeFormated);
      var apm = Math.ceil((CIRCLES / time) * 1e3 * 60 * 1.8);
      setApm(apm);
      console.log(apm);
      setClicks((clicks) => clicks + 1);
    }

    arr
      .slice()
      .reverse()
      .forEach((circle) => {
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
        target.on("pointerdown", () => handleHit(pixiApp, target, circle.n));

        pixiApp.stage.addChild(target);
      });
  }

  useEffect(() => {
    const pixiApp = new PIXI.Application({
      width: 500,
      height: 300,
      antialias: true,
      resolution: window.devicePixelRatio,
    });

    if (canvasRef.current && pixiApp.view instanceof HTMLCanvasElement) {
      canvasRef.current.appendChild(pixiApp.view);
    }

    for (let i = 0; i < selectedCircles; i++) {
      spawnCircle(numbers);
    }

    drawCircles(pixiApp, numbers.arr);

    console.log(numbers);

    const keyUpHandler = (e: any) => {
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
    document.addEventListener("keyup", keyUpHandler);

    return () => {
      pixiApp.destroy(true, { children: true });
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, [selectedCircles, resetToggle]);

  const changeSelectOptionHandler = (event: any) => {
    resetStats();
    setSelectedCircles(Number(event.target.value));
  };

  const handleClick = () => {
    if (!apm) {
      setClicks(clicks + 1);
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
        <div className="max-w-[300px] px-4 py-2 text-sm">
          <div className="flex justify-between font-bold">
            <p>APM</p>
            <p>{apm}</p>
          </div>
          <div className="flex justify-between font-bold">
            <p>time</p>
            <p>{time}</p>
          </div>
          <div className="flex justify-between">
            <p>clicks</p>
            <p>{clicks}</p>
          </div>
          <div className="flex justify-between">
            <p>hits</p>
            <p>{hits}</p>
          </div>
          <div className="flex justify-between">
            <p>wrong hits</p>
            <p>{wrongHits}</p>
          </div>
          <div className="flex justify-between">
            <p>misses</p>
            <p>{clicks - hits}</p>
          </div>
          <div className="flex justify-between">
            <p>type</p>
            <p>decrescent</p>
          </div>
          <div className="flex justify-between">
            <p>targets</p>
            <p>{selectedCircles}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

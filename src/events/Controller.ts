import nipplejs from 'nipplejs';
import { JoystickManagerEventTypes } from 'nipplejs';

export class Controller {

  isTop = false
  isLeft = false
  isRight = false
  isBottom = false
  joystick?: nipplejs.JoystickManager
  vector?: { x: number, y: number }

  canvas = document.body.querySelector('canvas') as HTMLCanvasElement

  screenSize = { w: innerWidth, h: innerHeight }
  mousePosition: { x: number, y: number } | false = false

  constructor({ joystick = false, click = false }) {

    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onResize = this.onResize.bind(this)

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener("resize", this.onResize);

    if (joystick) {

      this.joystick = nipplejs.create({
        zone: document.body.querySelector('.joystick') as HTMLDivElement,
        mode: 'semi', // 'semi',
        catchDistance: 150,
        color: '#99C46E33' // 'white'
      });

      (this.joystick
        .on('start end' as JoystickManagerEventTypes, () => {
          this.vector = undefined
        }) as unknown as nipplejs.JoystickManager)
        .on('move', (_, data: { vector: { x: number, y: number } }) => {
          this.vector = data.vector
        })

    } else if (click) {
      (document.body.querySelector('.joystick') as HTMLDivElement).addEventListener("click", this.onClick);
    } else {
      this.canvas.addEventListener("mousedown", this.onMouseDown);
      this.canvas.addEventListener("mouseup", this.onMouseUp);
      window.addEventListener("mouseleave", this.onMouseUp);
      this.canvas.addEventListener("touchstart", this.onTouchStart);
      this.canvas.addEventListener("touchmove", this.onTouchMove);
      this.canvas.addEventListener("touchend", this.onTouchEnd);
    }
  }

  private onTouchStart(event: TouchEvent) {
    this.mousePosition = {
      x: event.touches[0].clientX / this.screenSize.w,
      y: event.touches[0].clientY / this.screenSize.h
    }
    window.addEventListener('touchmove', this.onTouchMove)
  }

  private onTouchMove(event: TouchEvent) {
    this.mousePosition = {
      x: event.touches[0].clientX / this.screenSize.w,
      y: event.touches[0].clientY / this.screenSize.h
    }
  }

  private onTouchEnd() {
    window.removeEventListener('touchmove', this.onTouchMove)
  }

  private onMouseDown(event: MouseEvent) {
    this.mousePosition = {
      x: event.clientX / this.screenSize.w,
      y: event.clientY / this.screenSize.h
    }
    window.addEventListener('mousemove', this.onMouseMove)
  }

  private onMouseMove(event: MouseEvent) {
    this.mousePosition = {
      x: event.clientX / this.screenSize.w,
      y: event.clientY / this.screenSize.h
    }
  }

  private onMouseUp(event: MouseEvent) {
    this.mousePosition = {
      x: event.clientX / this.screenSize.w,
      y: event.clientY / this.screenSize.h
    }
    window.removeEventListener('mousemove', this.onMouseMove)
  }

  private onClick() {
    this.mousePosition = {
      x: 1,
      y: 1
    }
  }

  private onResize() {
    this.mousePosition = false
    this.screenSize = { w: innerWidth, h: innerHeight }
  }

  private onKeyDown(event: KeyboardEvent) {
    this.mousePosition = false
    switch (event.key) {
      case "ArrowLeft":
        this.isLeft = true
        break;
      case "ArrowRight":
        this.isRight = true
        break;
      case "ArrowUp":
        this.isTop = true
        break;
      case "ArrowDown":
        this.isBottom = true
        break;
    }

    if (this.joystick) {
      for (const joystick of this.joystick as unknown as (nipplejs.Joystick)[]) {
        joystick.remove()
      }
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    this.mousePosition = false
    switch (event.key) {
      case "ArrowLeft":
        this.isLeft = false
        break;
      case "ArrowRight":
        this.isRight = false
        break;
      case "ArrowUp":
        this.isTop = false
        break;
      case "ArrowDown":
        this.isBottom = false
        break;
    }
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('mouseleave', this.onMouseUp)
    this.canvas.removeEventListener('touchmove', this.onTouchMove)
    this.canvas.removeEventListener('touchend', this.onTouchEnd)
    window.removeEventListener("resize", this.onResize);
    (document.body.querySelector('.joystick') as HTMLDivElement).removeEventListener("click", this.onClick);

    if (this.joystick) {
      this.joystick.destroy()
      this.joystick = undefined
    }
  }
}
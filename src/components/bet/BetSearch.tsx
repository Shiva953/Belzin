"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ChatBet { 
    betTitle: string,
    betPubKey: string,
}

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#1C1C1E]/95 text-popover-foreground",
      className,
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-border/10 px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/40 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
      <span className="text-xs">⌘</span>K
    </kbd>
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-none", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none transition-all duration-200 ease-in-out",
      "hover:bg-accent/50 hover:text-accent-foreground",
      "group", // Added for child element transitions
      className,
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
}
CommandShortcut.displayName = "CommandShortcut"

export function CommandSearch({ chatBets }: {chatBets: ChatBet[]}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
    <button
      onClick={() => setOpen(true)}
      className="relative flex w-64 mx-auto mt-4 z-10 items-center justify-between rounded-xl border border-border/40 bg-[#1C1C1E]/50 backdrop-blur-3xl backdrop-saturate-300 px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent/50"
    >
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span className="font-mono text-white/70">Recent Bets...</span>
      </div>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/40 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
    
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg bg-transparent border-none">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md"
          aria-hidden="true" 
          onClick={() => setOpen(false)}
        />
        <Command className="relative z-50 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground rounded-2xl">
          <CommandInput placeholder="Search Bets..." className="font-mono text-white"/>
          <CommandList>
            <CommandGroup heading="Open Bets">
              {chatBets.map((bet, i) => (
                <CommandItem key={i} className="flex items-center gap-2 px-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50">
                    <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-purple-500 to-purple-600" />
                  </div>
                  <div className="flex flex-row items-center group-hover:text-white transition-all duration-200" onClick={() => window.open(`https://dial.to/?action=solana-action:http://belzin.fun/api/actions/bet?betId=${bet.betPubKey}`)}>
                    <span className="font-mono text-white/70 group-hover:text-white mx-2 transition-opacity duration-200">{bet.betTitle}</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200"/>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between border-t border-border/50 px-2 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>navigate</span>
              <div className="flex gap-1">
                <kbd className="rounded border border-border/40 bg-muted px-1.5">↑</kbd>
                <kbd className="rounded border border-border/40 bg-muted px-1.5">↓</kbd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>select</span>
              <kbd className="rounded border border-border/40 bg-muted px-1.5">enter</kbd>
            </div>
            <div className="flex items-center gap-2">
              <span>close</span>
              <kbd className="rounded border border-border/40 bg-muted px-1.5">esc</kbd>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
    </>
  )
}
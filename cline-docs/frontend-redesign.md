# Frontend Redesign Implementation Guide

This guide provides step-by-step instructions for implementing the main page redesign of Snowgoose. The redesign will restructure the main chat interface to have:

- Options bar at the top (initially showing just model and persona selection)
- Conversation component in the middle of the screen
- Text input area fixed at the bottom

## Phase 1: Component Analysis & Preparation

### Task 1: Review Existing Components

1. Open and review these key files:
   - `app/_ui/chat-wrapper.tsx`: Main layout component
   - `app/_ui/chat-form.tsx`: Form handling component
   - `app/_ui/conversation.tsx`: Message display component
2. Note down:
   - State management patterns
   - Data flow between components
   - Current component responsibilities

### Task 2: Create New Folder Structure

1. Create a new directory for chat-related components:
   ```bash
   mkdir -p app/_ui/chat
   ```
2. This will house our new and modified components

### Task 3: Plan State Modifications

1. Add new state to `chat-wrapper.tsx`:
   ```typescript
   const [showMoreOptions, setShowMoreOptions] = useState(false);
   const toggleMoreOptions = () => setShowMoreOptions(!showMoreOptions);
   ```

## Phase 2: Extract Input Component

### Task 4: Create TextInputArea Component

1. Create new file: `app/_ui/chat/text-input-area.tsx`
2. Copy relevant code from `chat-form.tsx`:
   - Text input field
   - Submit/Reset buttons
   - Associated state and handlers
3. Example structure:

   ```typescript
   interface TextInputAreaProps {
     onSubmit: (formData: FormData) => void;
     isSubmitting: boolean;
     onChange: (value: string) => void;
     onReset: () => void;
   }

   export default function TextInputArea({
     onSubmit,
     isSubmitting,
     onChange,
     onReset
   }: TextInputAreaProps) {
     const textAreaRef = useRef<HTMLTextAreaElement>(null);
     const [promptVal, setPromptVal] = useState("");

     // Copy relevant handlers from chat-form.tsx

     return (
       <div className="w-full">
         <label className="text-gray-700 text-xs" htmlFor="prompt">
           Enter your prompt:
         </label>
         <div className="overflow-hidden [&:has(textarea:focus)]:border-token-border-xheavy [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex flex-col w-full flex-grow relative border border-token-border-heavy bg-white rounded-2xl shadow-[0_0_0_2px_rgba(255,255,255,0.95)]">
           <textarea
             className="m-0 text-sm w-full resize-none border-0 bg-transparent py-[10px] pr-10 focus:ring-0 focus-visible:ring-0 md:py-3.5 md:pr-12 placeholder-black/50 pl-3 md:pl-4"
             id="prompt"
             name="prompt"
             ref={textAreaRef}
             onChange={handleTextAreaChange}
           ></textarea>
         </div>
         <div className="mt-3 flex">
           <button
             className="rounded-md text-sm bg-slate-300 p-2 hover:bg-slate-400 mr-3"
             disabled={isSubmitting}
             type="submit"
           >
             {isSubmitting ? (
               <div className="flex flex-row items-center">
                 <div className="pr-2">
                   <Spinner spinnerSize={SpinnerSize.sm} />
                 </div>
                 <div>Processing</div>
               </div>
             ) : (
               "Submit"
             )}
           </button>
           <button
             className="rounded-md text-sm bg-slate-200 p-2 hover:bg-slate-300"
             type="reset"
             onClick={onReset}
           >
             {"Reset"}
           </button>
         </div>
       </div>
     );
   }
   ```

## Phase 3: Extract Options Components

### Task 5: Create OptionsBar Component

1. Create new file: `app/_ui/chat/options-bar.tsx`
2. Implement the options bar structure:

   ```typescript
   interface OptionsBarProps {
     models: Model[];
     personas: Persona[];
     currentModel?: number;
     currentPersona?: number;
     disableSelection: boolean;
     onModelChange: (event: ChangeEvent) => void;
     showMoreOptions: boolean;
     toggleMoreOptions: () => void;
     children?: React.ReactNode;
   }

   export default function OptionsBar({
     models,
     personas,
     currentModel,
     currentPersona,
     disableSelection,
     onModelChange,
     showMoreOptions,
     toggleMoreOptions,
     children
   }: OptionsBarProps) {
     return (
       <div className="bg-slate-50 p-3 border-b">
         <div className="flex items-center justify-between">
           <div className="flex space-x-4">
             {/* Model Selection */}
             <div>
               <label className="text-gray-700 text-xs">Model</label>
               <SelectBox
                 name="model"
                 disableSelection={disableSelection}
                 defaultValue={currentModel ?? 0}
                 onChangeFunction={onModelChange}
               >
                 {models.map((model: Model) => (
                   <option value={model.id} key={model.id}>
                     {model.name}
                   </option>
                 ))}
               </SelectBox>
             </div>

             {/* Persona Selection */}
             <div>
               <label className="text-gray-700 text-xs">Persona</label>
               <SelectBox
                 name="persona"
                 disableSelection={disableSelection}
                 defaultValue={currentPersona ?? 0}
               >
                 {personas.map((persona: Persona) => (
                   <option value={persona.id} key={persona.id}>
                     {persona.name}
                   </option>
                 ))}
               </SelectBox>
             </div>
           </div>

           <button
             className="px-3 py-1 rounded-md bg-slate-200 text-sm hover:bg-slate-300"
             onClick={toggleMoreOptions}
           >
             {showMoreOptions ? "Less Options" : "More Options"}
           </button>
         </div>

         {showMoreOptions && (
           <div className="mt-4 grid grid-cols-2 gap-4">
             {children}
           </div>
         )}
       </div>
     );
   }
   ```

### Task 6: Create MoreOptions Component

1. Create new file: `app/_ui/chat/more-options.tsx`
2. Extract remaining options from `chat-form.tsx`:

   ```typescript
   interface MoreOptionsProps {
     outputFormats: OutputFormat[];
     mcpTools: MCPTool[];
     currentOutputFormat?: number;
     disableSelection: boolean;
     showFileUpload: boolean;
     showMCPTools: boolean;
     showTokenSliders: boolean;
   }

   export default function MoreOptions({
     outputFormats,
     mcpTools,
     currentOutputFormat,
     disableSelection,
     showFileUpload,
     showMCPTools,
     showTokenSliders
   }: MoreOptionsProps) {
     // Copy relevant state and handlers from chat-form.tsx

     return (
       <>
         {/* Output Format Selection */}
         <div>
           <label className="text-gray-700 text-xs">Output Format</label>
           <SelectBox
             name="outputFormat"
             disableSelection={disableSelection}
             defaultValue={currentOutputFormat ?? 0}
           >
             {outputFormats.map((format: OutputFormat) => (
               <option value={format.id} key={format.id}>
                 {format.name}
               </option>
             ))}
           </SelectBox>
         </div>

         {/* MCP Tools */}
         {showMCPTools && (
           <div>
             <label className="text-gray-700 text-xs">MCP Tool</label>
             <SelectBox
               name="mcpTool"
               disableSelection={disableSelection}
               defaultValue={0}
             >
               <option value={0}>No Tool</option>
               {mcpTools.map((tool: MCPTool) => (
                 <option value={tool.id} key={tool.id}>
                   {tool.name}
                 </option>
               ))}
             </SelectBox>
           </div>
         )}

         {/* File Upload */}
         {showFileUpload && (
           <div>
             <label className="text-gray-700 text-xs">Image</label>
             <input
               className="w-full text-sm text-slate-500 border border-slate-300 cursor-pointer rounded-md bg-slate-50 file:text-xs file:border-0 file:bg-slate-300 file:rounded-md file:h-full file:pt-1"
               name="image"
               type="file"
               accept="image/*"
             />
           </div>
         )}

         {/* Token Sliders */}
         {showTokenSliders && (
           // Copy token slider implementation from chat-form.tsx
         )}
       </>
     );
   }
   ```

## Phase 4: Modify Main Components

### Task 7: Update chat-form.tsx

1. Modify the component to be a controller:
   ```typescript
   export default function ChatForm({
     updateMessage,
     updateShowSpinner,
     responseHistory,
     resetChat,
     currentChat,
     personas,
     models,
     outputFormats,
     mcpTools,
     apiVendors,
   }: FormProps) {
     // Keep state management and handlers
     // Remove UI elements that have been moved to new components

     return (
       <form action={handleSubmit}>
         <OptionsBar
           models={models}
           personas={personas}
           currentModel={currentChat?.modelId}
           currentPersona={currentChat?.personaId}
           disableSelection={responseHistory.length > 0}
           onModelChange={modelChange}
           showMoreOptions={showMoreOptions}
           toggleMoreOptions={toggleMoreOptions}
         >
           <MoreOptions
             outputFormats={outputFormats}
             mcpTools={mcpTools}
             currentOutputFormat={currentChat?.outputFormatId}
             disableSelection={responseHistory.length > 0}
             showFileUpload={showFileUpload}
             showMCPTools={showMCPTools}
             showTokenSliders={showTokenSliders}
           />
         </OptionsBar>

         <TextInputArea
           onSubmit={handleSubmit}
           isSubmitting={isSubmitting}
           onChange={handleTextAreaChange}
           onReset={handleReset}
         />
       </form>
     );
   }
   ```

### Task 8: Modify chat-wrapper.tsx

1. Update the layout structure:

   ```typescript
   export default function ChatWrapper({
     personas,
     models,
     outputFormats,
     mcpTools,
     apiVendors,
     user,
   }: ChatWrapperProps) {
     // Existing state management...
     const [showMoreOptions, setShowMoreOptions] = useState(false);

     return (
       <div className="flex flex-col h-screen">
         {/* Main content area */}
         <div className="flex-grow flex flex-col overflow-hidden">
           {/* Chat form with options */}
           <ChatForm
             updateMessage={updateMessage}
             updateShowSpinner={updateShowSpinner}
             responseHistory={response}
             resetChat={resetChat}
             currentChat={currentChat}
             personas={personas}
             models={models}
             outputFormats={outputFormats}
             mcpTools={mcpTools}
             apiVendors={apiVendors}
           />

           {/* Conversation area - scrollable */}
           <div className="flex-grow overflow-y-auto p-4">
             <Conversation
               chats={response}
               showSpinner={showConversationSpinner}
               imageURL={imageURL}
               renderTypeName={renderTypeName}
             />
           </div>
         </div>

         {/* History panel - unchanged */}
         <Transition>
           {/* Existing history UI */}
         </Transition>
       </div>
     );
   }
   ```

## Phase 5: State Management & Data Flow

### Task 9: Update State Management

1. Ensure all state is properly managed in `chat-wrapper.tsx`
2. Update callbacks and event handlers
3. Verify data flow between components

### Task 10: Implement Data Flow

1. Test form submission flow
2. Verify options state management
3. Ensure proper prop drilling

## Phase 6: Styling & Responsive Design

### Task 11: Implement Core Layout

1. Add responsive Tailwind classes:
   ```typescript
   // In chat-wrapper.tsx
   <div className="flex flex-col h-screen">
     <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
       {/* Content */}
     </div>
   </div>
   ```

### Task 12: Add Responsive Adjustments

1. Add mobile-first responsive classes:
   ```typescript
   // In options-bar.tsx
   <div className="bg-slate-50 p-2 md:p-3 border-b">
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
       <div className="flex flex-col sm:flex-row sm:space-x-4">
         {/* Options content */}
       </div>
     </div>
   </div>
   ```

## Phase 7: Testing & Refinement

### Task 13: Basic Functionality Testing

1. Test all form submissions
2. Verify options toggling
3. Check conversation display
4. Test input functionality

### Task 14: Edge Case Testing

1. Test with empty conversations
2. Test with long messages
3. Verify form validation
4. Test across different screen sizes

### Task 15: UI Refinements

1. Adjust spacing and alignment
2. Fine-tune transitions
3. Ensure consistent styling

## Phase 8: Documentation & Finalization

### Task 16: Component Documentation

1. Document props and interfaces
2. Explain component relationships
3. Document state management

### Task 17: Update Dependencies

1. Check for affected components
2. Update imports
3. Fix any broken references

### Task 18: Final Review

1. Test across devices
2. Perform code review
3. Deploy changes

## Implementation Notes

### State Management

- Keep existing patterns
- Use React hooks consistently
- Maintain type safety

### Styling Guidelines

- Use Tailwind CSS classes
- Follow mobile-first approach
- Maintain existing color scheme

### Best Practices

- Keep components focused
- Maintain type safety
- Follow existing patterns
- Document changes

### Testing Checklist

- [ ] Form submission works
- [ ] Options toggle correctly
- [ ] Conversation displays properly
- [ ] Input works as expected
- [ ] Responsive design works
- [ ] No console errors
- [ ] All features functional

## Troubleshooting Common Issues

### State Management

- Check prop drilling
- Verify callback functions
- Ensure proper type definitions

### Layout Issues

- Check Tailwind classes
- Verify responsive breakpoints
- Test overflow handling

### Form Submission

- Verify form data
- Check submission handlers
- Test validation logic

## Additional Resources

### Tailwind CSS

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Flexbox Guide](https://tailwindcss.com/docs/flex)
- [Grid Guide](https://tailwindcss.com/docs/grid-template-columns)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### React

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Hooks Reference](https://reactjs.org/docs/hooks-reference.html)

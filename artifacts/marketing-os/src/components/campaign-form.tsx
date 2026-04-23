import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetThemes, getGetThemesQueryKey } from "@workspace/api-client-react";
import type { GenerateCampaignBody } from "@workspace/api-client-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

const formSchema = z.object({
  brand: z.string().min(2, "Brand name must be at least 2 characters."),
  product: z.string().min(5, "Product description must be at least 5 characters."),
  audience: z.string().min(5, "Audience description must be at least 5 characters."),
  theme: z.string().min(1, "Please select a theme."),
});

type FormValues = z.infer<typeof formSchema>;

interface CampaignFormProps {
  onSubmit: (data: GenerateCampaignBody) => void;
  isGenerating: boolean;
}

export function CampaignForm({ onSubmit, isGenerating }: CampaignFormProps) {
  const { data: themesData, isLoading: isLoadingThemes } = useGetThemes({
    query: {
      queryKey: getGetThemesQueryKey()
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      product: "",
      audience: "",
      theme: "",
    },
  });

  function handleSubmit(values: FormValues) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Acme Corp" data-testid="input-brand" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product or Service</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What are you selling? (e.g. AI-powered ergonomic office chairs)" 
                  className="resize-none h-24"
                  data-testid="input-product"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Who is this for? (e.g. Remote workers and tech professionals)" 
                  className="resize-none h-20"
                  data-testid="input-audience"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Theme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingThemes}>
                <FormControl>
                  <SelectTrigger data-testid="select-theme">
                    <SelectValue placeholder={isLoadingThemes ? "Loading themes..." : "Select a theme"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {themesData?.themes?.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id} data-testid={`theme-option-${theme.id}`}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The stylistic direction of the campaign content.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium shadow-lg hover:shadow-primary/20 transition-all duration-300"
          disabled={isGenerating}
          data-testid="button-submit-campaign"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Campaign...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Campaign
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

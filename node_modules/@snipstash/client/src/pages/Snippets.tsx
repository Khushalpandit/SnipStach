import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Code as CodeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Snippets() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log("State: snippetToDelete changed to", snippetToDelete);
  }, [snippetToDelete]);

  useEffect(() => {
    console.log("State: deleteDialogOpen changed to", deleteDialogOpen);
  }, [deleteDialogOpen]);

  // Fetch snippets
  const {
    data: snippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>({
    queryKey: ["snippets"],
    queryFn: async () => {
      const response = await api.get("/snippets");
      console.log("Fetched snippets:", response.data.snippets);
      return response.data.snippets || [];
    },
  });

  // Get unique languages for filter
  const languages = snippets
    ? ["all", ...new Set(snippets.map((snippet) => snippet.language))]
    : ["all"];

  // Filter snippets
  const filteredSnippets = snippets?.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLanguage =
      languageFilter === "all" || snippet.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  // Delete snippet mutation
  const { mutate: deleteSnippet, isPending: isDeleting } = useMutation({
    mutationFn: async (snippetId: string) => {
      console.log("Mutation function called with ID:", snippetId);
      if (!snippetId) {
        console.error("Mutation called with undefined ID!");
        throw new Error("Snippet ID is undefined"); // Throw error to stop mutation
      }
      console.log("Attempting to delete snippet:", snippetId);
      try {
        const response = await api.delete(`/snippets/${snippetId}`);
        console.log("Delete response:", response);
        return response;
      } catch (error) {
        console.error("Delete API error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Delete successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      setDeleteDialogOpen(false);
      setSnippetToDelete(null); // Explicitly reset on success
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      // Keep dialog open and ID set on error to allow retry
    },
  });

  const handleDeleteClick = (snippetId: string) => {
    console.log("Delete icon clicked, setting snippet ID:", snippetId);
    setSnippetToDelete(snippetId);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading snippets. Please try again later.
      </Alert>
    );
  }

  console.log("Rendering Snippets page. Filtered snippets:", filteredSnippets);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          My Snippets
        </Typography>
        <Button
          variant="contained"
          startIcon={<CodeIcon />}
          onClick={() => navigate("/snippets/new")}
        >
          New Snippet
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={languageFilter}
            label="Language"
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Snippets Grid */}
      <Grid container spacing={3}>
        {filteredSnippets?.map((snippet) => {
          console.log("Rendering snippet card:", snippet);
          return (
            <Grid item xs={12} sm={6} md={4} key={snippet.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {snippet.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {snippet.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {snippet.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Language: {snippet.language}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Created: {new Date(snippet.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/snippets/${snippet.id}`)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(snippet.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}

        {/* Empty State */}
        {(!filteredSnippets || filteredSnippets.length === 0) && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No snippets found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || languageFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first snippet to get started"}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          console.log("Closing dialog");
          setDeleteDialogOpen(false);
          setSnippetToDelete(null); // Reset ID on close as well
        }}
      >
        <DialogTitle>Delete Snippet</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this snippet? This action cannot be
            undone.
          </Typography>
          {/* Display the snippetToDelete ID for debugging */}
          {snippetToDelete && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Deleting ID: {snippetToDelete}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              console.log("Cancel clicked");
              setDeleteDialogOpen(false);
              setSnippetToDelete(null); // Reset ID on cancel
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log("Delete button clicked in dialog.");
              console.log(
                "Value of snippetToDelete at click:",
                snippetToDelete
              );
              if (snippetToDelete) {
                deleteSnippet(snippetToDelete);
              } else {
                // This case should ideally not happen with the disabled prop
                console.error(
                  "Delete clicked but snippetToDelete is null or undefined"
                );
              }
            }}
            color="error"
            disabled={isDeleting || !snippetToDelete} // Disable if deleting or no ID is set
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
